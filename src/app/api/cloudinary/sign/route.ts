import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCloudinaryConfigured, signUpload } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const folder = typeof body.folder === "string" ? body.folder : "portfolio";
  try {
    return NextResponse.json(signUpload(`portfolio/${folder.replace(/[^a-z0-9/_-]/gi, "")}`));
  } catch {
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
