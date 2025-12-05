import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  return <>{children}</>;
}
