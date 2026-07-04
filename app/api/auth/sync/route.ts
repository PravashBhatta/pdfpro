import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/index";
import { users } from "@/src/db/schema";
import { adminAuth } from "@/src/lib/firebase-admin";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]!;
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!uid || !email) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Upsert user settings in Postgres (Cloud SQL)
    const existingUsers = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

    let user;
    if (existingUsers.length === 0) {
      // Create new user record
      const inserted = await db.insert(users).values({
        uid,
        email,
        isPro: false,
        theme: "emerald",
        activeModel: "gemini-3.5-flash",
      }).returning();
      user = inserted[0];
    } else {
      user = existingUsers[0];
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("Auth sync error: ", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
