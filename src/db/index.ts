import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";

const { Pool } = pg;

// Use process.env.DATABASE_URL or fallback options
const connectionString = process.env.DATABASE_URL;

const pool = new Pool(
  process.env.SQL_HOST
    ? {
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
      }
    : connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "postgres",
      }
);

const rawDb = drizzle(pool);

// --- Graceful JSON DB Fallback for Local Development ---
const LOCAL_DB_PATH = path.join(process.cwd(), "local_db.json");

function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading local DB file", e);
  }
  return { users: [], sessionLogs: [] };
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing local DB file", e);
  }
}

function isConnectionError(err: any) {
  if (!err) return false;
  const errMsg = String(err.message || err.code || err).toLowerCase();
  return (
    errMsg.includes("connrefused") ||
    errMsg.includes("notfound") ||
    errMsg.includes("timeout") ||
    errMsg.includes("could not connect") ||
    err.code === "ECONNREFUSED" ||
    err.code === "42P01" || // undefined_table
    errMsg.includes("does not exist") ||
    errMsg.includes("message code not yet implemented")
  );
}

function getTableName(table: any): string {
  try {
    const { getTableConfig } = require("drizzle-orm");
    const config = getTableConfig(table);
    if (config && config.name) return config.name;
  } catch (e) {}

  if (table && table._ && table._.name) {
    return table._.name;
  }
  
  if (table && ('email' in table || 'theme' in table)) {
    return "users";
  }
  return "session_logs";
}

function extractUidFromWhere(whereCond: any): string | null {
  if (!whereCond) return null;
  const visited = new Set();
  
  function findStringVal(obj: any): string | null {
    if (!obj || typeof obj !== "object" || visited.has(obj)) return null;
    visited.add(obj);
    
    if ('right' in obj && typeof obj.right === 'string') {
      return obj.right;
    }
    if ('value' in obj && typeof obj.value === 'string') {
      return obj.value;
    }
    
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "string" && val !== "uid" && val.length > 5) {
        return val;
      }
      if (typeof val === "object") {
        const found = findStringVal(val);
        if (found) return found;
      }
    }
    return null;
  }
  
  return findStringVal(whereCond);
}

function executeLocalSelect(table: any, whereCond: any, orderByField: any, limitVal: number | undefined) {
  const tableName = getTableName(table);
  const dbData = readLocalDb();
  let rows = tableName === "users" ? dbData.users : dbData.sessionLogs;

  if (whereCond) {
    const uid = extractUidFromWhere(whereCond);
    if (uid) {
      rows = rows.filter((r: any) => r.uid === uid);
    }
  }

  if (tableName === "session_logs") {
    rows = [...rows].sort((a: any, b: any) => b.id - a.id); // descending for recent logs
  }

  if (limitVal !== undefined) {
    rows = rows.slice(0, limitVal);
  }

  return rows;
}

function executeLocalInsert(table: any, data: any) {
  const tableName = getTableName(table);
  const dbData = readLocalDb();
  const record = { ...data };

  if (tableName === "users") {
    record.id = dbData.users.length + 1;
    record.createdAt = record.createdAt || new Date().toISOString();
    record.theme = record.theme || "emerald";
    record.activeModel = record.activeModel || "gemini-3.5-flash";
    record.isPro = record.isPro ?? false;
    
    dbData.users.push(record);
  } else {
    record.id = dbData.sessionLogs.length + 1;
    record.createdAt = record.createdAt || new Date().toISOString();
    
    dbData.sessionLogs.push(record);
  }

  writeLocalDb(dbData);
  return [record];
}

function executeLocalUpdate(table: any, updateData: any, whereCond: any) {
  const tableName = getTableName(table);
  const dbData = readLocalDb();

  if (tableName === "users") {
    const uid = extractUidFromWhere(whereCond);
    if (uid) {
      dbData.users = dbData.users.map((u: any) => {
        if (u.uid === uid) {
          return { ...u, ...updateData };
        }
        return u;
      });
    }
  }

  writeLocalDb(dbData);
  return { success: true };
}

function wrapSelect(actualSelect: any) {
  let table: any;
  let orderByField: any;
  let limitVal: number | undefined;
  let whereCond: any;

  const builder = {
    from: (t: any) => {
      table = t;
      actualSelect = actualSelect.from(t);
      return builder;
    },
    where: (cond: any) => {
      whereCond = cond;
      actualSelect = actualSelect.where(cond);
      return builder;
    },
    orderBy: (field: any) => {
      orderByField = field;
      actualSelect = actualSelect.orderBy(field);
      return builder;
    },
    limit: (n: number) => {
      limitVal = n;
      actualSelect = actualSelect.limit(n);
      return builder;
    },
    then: (onfulfilled?: any, onrejected?: any) => {
      return actualSelect.then(onfulfilled).catch((err: any) => {
        if (isConnectionError(err)) {
          try {
            const res = executeLocalSelect(table, whereCond, orderByField, limitVal);
            return onfulfilled ? onfulfilled(res) : res;
          } catch (fallbackErr) {
            return onrejected ? onrejected(fallbackErr) : Promise.reject(fallbackErr);
          }
        }
        return onrejected ? onrejected(err) : Promise.reject(err);
      });
    }
  };

  return builder;
}

function wrapInsert(actualInsert: any, table: any) {
  let valuesData: any;

  const builder = {
    values: (data: any) => {
      valuesData = data;
      actualInsert = actualInsert.values(data);
      return builder;
    },
    returning: () => {
      actualInsert = actualInsert.returning();
      return builder;
    },
    then: (onfulfilled?: any, onrejected?: any) => {
      return actualInsert.then(onfulfilled).catch((err: any) => {
        if (isConnectionError(err)) {
          try {
            const res = executeLocalInsert(table, valuesData);
            return onfulfilled ? onfulfilled(res) : res;
          } catch (fallbackErr) {
            return onrejected ? onrejected(fallbackErr) : Promise.reject(fallbackErr);
          }
        }
        return onrejected ? onrejected(err) : Promise.reject(err);
      });
    }
  };

  return builder;
}

function wrapUpdate(actualUpdate: any, table: any) {
  let updateData: any;
  let whereCond: any;

  const builder = {
    set: (data: any) => {
      updateData = data;
      actualUpdate = actualUpdate.set(data);
      return builder;
    },
    where: (cond: any) => {
      whereCond = cond;
      actualUpdate = actualUpdate.where(cond);
      return builder;
    },
    then: (onfulfilled?: any, onrejected?: any) => {
      return actualUpdate.then(onfulfilled).catch((err: any) => {
        if (isConnectionError(err)) {
          try {
            const res = executeLocalUpdate(table, updateData, whereCond);
            return onfulfilled ? onfulfilled(res) : res;
          } catch (fallbackErr) {
            return onrejected ? onrejected(fallbackErr) : Promise.reject(fallbackErr);
          }
        }
        return onrejected ? onrejected(err) : Promise.reject(err);
      });
    }
  };

  return builder;
}

export const db: any = {
  select: (...args: any[]) => wrapSelect((rawDb.select as any)(...args)),
  insert: (table: any) => wrapInsert(rawDb.insert(table), table),
  update: (table: any) => wrapUpdate(rawDb.update(table), table),
};

export { pool };

