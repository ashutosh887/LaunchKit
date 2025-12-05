import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "ok",
      message: "Webhook endpoint is ready",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { 
      id, 
      email_addresses, 
      first_name, 
      last_name, 
      image_url,
      public_metadata,
      organization_memberships 
    } = evt.data;

    const email = email_addresses[0]?.email_address || "";
    const role = 
      (public_metadata as { role?: string })?.role || 
      (organization_memberships?.[0]?.role as string) || 
      "user";

    try {
      if (email) {
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingByEmail) {
          if (existingByEmail.clerkId === id) {
            return new Response("User already exists", { status: 200 });
          }
          
          await prisma.user.update({
            where: { email },
            data: {
              clerkId: id,
              firstName: first_name || existingByEmail.firstName,
              lastName: last_name || existingByEmail.lastName,
              fullName: first_name && last_name 
                ? `${first_name} ${last_name}` 
                : existingByEmail.fullName,
              imageUrl: image_url || existingByEmail.imageUrl,
              role: role,
            },
          });
          return new Response("User updated", { status: 200 });
        }
      }

      const existingByClerkId = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (existingByClerkId) {
        return new Response("User already exists", { status: 200 });
      }

      await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          fullName: first_name && last_name 
            ? `${first_name} ${last_name}` 
            : first_name || last_name || null,
          imageUrl: image_url || null,
          role: role,
        },
      });

      return new Response("User created successfully", { status: 200 });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        return new Response("User already exists", { status: 200 });
      }
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { 
      id, 
      email_addresses, 
      first_name, 
      last_name, 
      image_url,
      public_metadata,
      organization_memberships 
    } = evt.data;

    const role = 
      (public_metadata as { role?: string })?.role || 
      (organization_memberships?.[0]?.role as string) || 
      "user";

    try {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0]?.email_address || "",
            firstName: first_name || null,
            lastName: last_name || null,
            fullName: first_name && last_name 
              ? `${first_name} ${last_name}` 
              : first_name || last_name || null,
            imageUrl: image_url || null,
            role: role,
          },
        });
        return new Response("User created successfully", { status: 200 });
      }

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name || null,
          lastName: last_name || null,
          fullName: first_name && last_name 
            ? `${first_name} ${last_name}` 
            : first_name || last_name || null,
          imageUrl: image_url || null,
          role: role,
        },
      });

      return new Response("User updated successfully", { status: 200 });
    } catch {
      return new Response("Error updating user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      return new Response("User deleted successfully", { status: 200 });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        return new Response("User not found", { status: 200 });
      }
      return new Response("Error deleting user", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}

