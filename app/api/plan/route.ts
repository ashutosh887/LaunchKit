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
      select: { id: true },
    });

    if (!dbUser) {
      return new Response(
        JSON.stringify({ error: "User not found in database" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const planInfo = await getUserPlanInfo(dbUser.id);

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
      JSON.stringify({ 
        error: "Failed to fetch plan information",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

