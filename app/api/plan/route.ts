import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserPlanInfo } from "@/lib/plan";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    const userId = dbUser?.id || null;
    const planInfo = await getUserPlanInfo(userId);

    return new Response(
      JSON.stringify(planInfo),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Plan info error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch plan information" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

