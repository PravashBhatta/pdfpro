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
    const { uid } = decodedToken;

    if (!uid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const body = await req.json();
    const { theme, activeModel, customApiKey, isPro } = body;

    const updateData: any = {};
    if (theme !== undefined) updateData.theme = theme;
    if (activeModel !== undefined) updateData.activeModel = activeModel;
    if (customApiKey !== undefined) updateData.customApiKey = customApiKey;
    if (isPro !== undefined) updateData.isPro = isPro;

    await db.update(users).set(updateData).where(eq(users.uid, uid));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Auth preferences save error: ", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
