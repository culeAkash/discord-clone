import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) => {
  // console.log("delete channel");

  const channelId = (await params).channelId;
  const searchParams = request.nextUrl.searchParams;
  const serverId = searchParams.get("serverId");
  // console.log(channelId, serverId);

  if (!channelId || !serverId) {
    return NextResponse.json(
      {
        success: false,
        message: "Channel ID and Server ID is required.",
      },
      {
        status: 400,
      }
    );
  }

  const profile = await currentProfile();

  if (!profile) {
    return NextResponse.json(
      {
        success: false,
        message: "User not authenticated.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          deleteMany: {
            id: channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });
    if (!server) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete channel.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Channel deleted successfully.",
        data: { server },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("DELETE_CHANNEL_ERROR", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete channel.",
      },
      {
        status: 500,
      }
    );
  }
};
