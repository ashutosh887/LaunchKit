import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardClient />
    </AdminGuard>
  );
}
