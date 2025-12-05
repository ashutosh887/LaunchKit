import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import config from "@/config";

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

  try {
    if (eventType === "user.created") {
      const data = evt.data;
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
        phone_numbers,
        public_metadata,
        private_metadata,
        unsafe_metadata,
        external_id,
        last_sign_in_at,
        password_enabled,
        two_factor_enabled,
        totp_enabled,
        backup_code_enabled,
        organization_memberships,
      } = data;

      const email = email_addresses?.[0]?.email_address || "";
      const emailVerified = email_addresses?.[0]?.verification?.status === "verified";
      const phoneVerified = phone_numbers?.[0]?.verification?.status === "verified";
      const role = config.roles.admin.includes(email)
        ? "admin"
        : config.roles.default;

      const userData = {
        clerkId: id,
        email: email,
        firstName: first_name || null,
        lastName: last_name || null,
        fullName: first_name && last_name
          ? `${first_name} ${last_name}`
          : first_name || last_name || null,
        imageUrl: image_url || null,
        username: username || null,
        phoneNumbers: (phone_numbers ? (phone_numbers as unknown as Prisma.InputJsonValue) : null),
        emailAddresses: (email_addresses ? (email_addresses as unknown as Prisma.InputJsonValue) : null),
        publicMetadata: (public_metadata ? (public_metadata as unknown as Prisma.InputJsonValue) : null),
        privateMetadata: (private_metadata ? (private_metadata as unknown as Prisma.InputJsonValue) : null),
        unsafeMetadata: (unsafe_metadata ? (unsafe_metadata as unknown as Prisma.InputJsonValue) : null),
        externalId: external_id || null,
        lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : null,
        passwordEnabled: password_enabled || false,
        twoFactorEnabled: two_factor_enabled || false,
        totpEnabled: totp_enabled || false,
        backupCodeEnabled: backup_code_enabled || false,
        emailVerified: emailVerified || false,
        phoneVerified: phoneVerified || false,
        organizationMemberships: (organization_memberships ? (organization_memberships as unknown as Prisma.InputJsonValue) : null),
        role: role,
      };

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
            data: userData,
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
        data: userData,
      });

      return new Response("User created successfully", { status: 200 });
    }

    if (eventType === "user.updated") {
      const data = evt.data;
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
        phone_numbers,
        public_metadata,
        private_metadata,
        unsafe_metadata,
        external_id,
        last_sign_in_at,
        password_enabled,
        two_factor_enabled,
        totp_enabled,
        backup_code_enabled,
        organization_memberships,
      } = data;

      const email = email_addresses?.[0]?.email_address || "";
      const emailVerified = email_addresses?.[0]?.verification?.status === "verified";
      const phoneVerified = phone_numbers?.[0]?.verification?.status === "verified";
      const role = config.roles.admin.includes(email)
        ? "admin"
        : config.roles.default;

      const userData = {
        email: email,
        firstName: first_name || null,
        lastName: last_name || null,
        fullName: first_name && last_name
          ? `${first_name} ${last_name}`
          : first_name || last_name || null,
        imageUrl: image_url || null,
        username: username || null,
        phoneNumbers: (phone_numbers ? (phone_numbers as unknown as Prisma.InputJsonValue) : null),
        emailAddresses: (email_addresses ? (email_addresses as unknown as Prisma.InputJsonValue) : null),
        publicMetadata: (public_metadata ? (public_metadata as unknown as Prisma.InputJsonValue) : null),
        privateMetadata: (private_metadata ? (private_metadata as unknown as Prisma.InputJsonValue) : null),
        unsafeMetadata: (unsafe_metadata ? (unsafe_metadata as unknown as Prisma.InputJsonValue) : null),
        externalId: external_id || null,
        lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : null,
        passwordEnabled: password_enabled || false,
        twoFactorEnabled: two_factor_enabled || false,
        totpEnabled: totp_enabled || false,
        backupCodeEnabled: backup_code_enabled || false,
        emailVerified: emailVerified || false,
        phoneVerified: phoneVerified || false,
        organizationMemberships: (organization_memberships ? (organization_memberships as unknown as Prisma.InputJsonValue) : null),
        role: role,
      };

      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            clerkId: id,
            ...userData,
          },
        });
        return new Response("User created successfully", { status: 200 });
      }

      await prisma.user.update({
        where: { clerkId: id },
        data: userData,
      });

      return new Response("User updated successfully", { status: 200 });
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
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return new Response("User already exists", { status: 200 });
      }
      if (error.code === "P2025") {
        return new Response("Resource not found", { status: 200 });
      }
    }
  }

  return new Response(`Event ${eventType} acknowledged`, { status: 200 });
}

