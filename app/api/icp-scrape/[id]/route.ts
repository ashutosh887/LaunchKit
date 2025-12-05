import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await currentUser();
    const userId = user?.id
      ? await prisma.user
          .findUnique({ where: { clerkId: user.id } })
          .then((u) => u?.id || null)
      : null;

    const resolvedParams = params instanceof Promise ? await params : params;

    const analysis = await prisma.iCPAnalysis.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!analysis) {
      return new Response(JSON.stringify({ error: "Analysis not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (userId && analysis.userId && analysis.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        analysis: {
          ...analysis,
          icpResult: analysis.icpResult,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Get analysis error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
