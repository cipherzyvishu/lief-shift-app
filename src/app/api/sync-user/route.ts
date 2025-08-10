import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Sync user to database
    const user = await prisma.user.upsert({
      where: { auth0Id: session.user.sub as string },
      create: {
        auth0Id: session.user.sub as string,
        email: session.user.email as string,
        name: session.user.name as string || null,
        role: Role.CARE_WORKER
      },
      update: {
        email: session.user.email as string,
        name: session.user.name as string || null
      }
    });

    console.log("User successfully synced with database:", user.email);

    return NextResponse.json({
      success: true,
      message: "User synced successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Database sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
