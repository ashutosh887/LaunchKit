import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  ventureName: z.string().min(1, "Venture name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = waitlistSchema.parse(body);

    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        email: validatedData.email,
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        email: validatedData.email,
        ventureName: validatedData.ventureName,
      },
    });

    return NextResponse.json(
      { message: "Successfully joined waitlist", id: entry.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
