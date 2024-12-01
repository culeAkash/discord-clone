import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  const serverId = (await params).serverId;
  const body = await request.json();
  const { name, type } = body;

  if (!serverId || !name || !type) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields : serverId, name, type",
      },
      {
        status: 400,
      }
    );
  }

  // console.log(serverId);

  if (name === "general") {
    return NextResponse.json(
      {
        success: false,
        message: "Channel name cannot be 'general'",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const profile = await currentProfile();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to create a channel.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUserId = profile?.id;
    // console.log(serverId, currentUserId);

    const member = await db.member.findFirst({
      where: {
        serverId,
        profileId: currentUserId,
      },
    });
    // console.log(member);

    if (!member || member.role === "GUEST") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to create a channel.",
        },
        {
          status: 403,
        }
      );
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: currentUserId,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: currentUserId,
            name,
            type,
          },
        },
      },
    });
    return NextResponse.json(
      {
        success: true,
        message: "Channel created successfully.",
        data: { server },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("[CREATE_CHANNEL_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create channel.",
      },
      {
        status: 500,
      }
    );
  }
};
