import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware using the adapter-free config to guard /admin.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
