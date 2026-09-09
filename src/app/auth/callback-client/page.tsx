import { redirect } from "next/navigation";

// Legacy route retained only so stale external redirect configuration fails safely.
// Google OAuth completes exclusively through the PKCE server callback at /auth/callback.
export default function CallbackClientPage() {
  redirect("/auth/login?error=auth_callback_failed");
}
