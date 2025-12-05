import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/lib/auth";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const isAdmin = await checkIsAdmin(userId);
  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
