import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  ventureName: z.string().min(1, "Venture name is required"),
});

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Waitlist endpoint is ready",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = waitlistSchema.parse(body);

    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingEntry) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        email: validatedData.email,
        ventureName: validatedData.ventureName,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Successfully joined waitlist",
        id: entry.id,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: error.issues[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
