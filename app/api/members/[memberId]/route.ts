import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) => {
  const searchParams = request.nextUrl.searchParams;
  const serverId = searchParams.get("serverId");
  const memberId = (await params).memberId;

  if (!serverId || !memberId) {
    return NextResponse.json(
      {
        success: false,
        message: "Server ID or Member ID is required.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const user = await currentProfile();

    const userId = user?.id;

    const member = await db.member.findFirst({
      where: { profileId: userId, serverId: serverId },
    });

    if (!member || member.role === "GUEST") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to perform this action.",
        },
        {
          status: 403,
        }
      );
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: userId,
      },
      data: {
        members: {
          deleteMany: {
            id: memberId,
            profileId: {
              not: userId,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully.",
      data: {
        server,
      },
    });
  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the member.",
      },
      {
        status: 500,
      }
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) => {
  const searchParams = request.nextUrl.searchParams;
  const serverId = searchParams.get("serverId");
  const role = searchParams.get("role");
  const memberId = (await params).memberId;

  if (!serverId || !memberId || !role) {
    return NextResponse.json(
      {
        success: false,
        message: "Server ID or Member ID is required.",
      },
      {
        status: 400,
      }
    );
  }
  //   console.log(serverId, memberId, role);
  try {
    const user = await currentProfile();

    const userId = user?.id;

    const member = await db.member.findFirst({
      where: { profileId: userId, serverId: serverId },
    });

    if (!member || member.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to perform this action.",
        },
        {
          status: 403,
        }
      );
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
        profileId: userId,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: userId,
              },
            },
            data: {
              role: role === "MODERATOR" ? "MODERATOR" : "GUEST",
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Updated role for member ${memberId} on server ${serverId} to ${role}.`,
        data: {
          server: updatedServer,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating the role.",
      },
      {
        status: 500,
      }
    );
  }
};
