import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/index";
import { sessionLogs } from "@/src/db/schema";
import { adminAuth } from "@/src/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    let uid: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]!;
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        uid = decodedToken.uid || null;
      } catch (err) {
        console.warn("Log authentication header present but failed to verify: ", err);
      }
    }

    const { type, action, status } = await req.json();

    if (!type || !action || !status) {
      return NextResponse.json({ error: "Missing log attributes" }, { status: 400 });
    }

    const insertedLog = await db.insert(sessionLogs).values({
      userId: uid,
      type,
      action,
      status,
    }).returning();

    return NextResponse.json({ success: true, log: insertedLog[0] });
  } catch (err: any) {
    console.error("Session logger server error: ", err);
    return NextResponse.json({ error: err.message || "Failed to log action" }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  try {
    // Return last 30 logs for the viewer
    const logs = await db.select().from(sessionLogs).orderBy(sessionLogs.id).limit(30);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("Fetch session logs error: ", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve logs" }, { status: 500 });
  }
}
