import { auth } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth";
import { SidebarContent } from "./SidebarContent";

export async function Sidebar() {
  const { userId } = await auth();
  const isAdmin = userId ? await checkIsAdmin(userId) : false;
  return <SidebarContent isAdmin={isAdmin} />;
}
