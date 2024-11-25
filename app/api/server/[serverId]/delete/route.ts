import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  const serverId = (await params).serverId;

  if (!serverId) {
    return NextResponse.json(
      { success: false, message: "Server not found." },
      { status: 400 }
    );
  }

  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in.",
        },
        {
          status: 401,
        }
      );
    }

    const currentUserId = profile.id;

    const server = await db.server.delete({
      where: {
        id: serverId,
        profileId: currentUserId,
      },
    });

    if (!server) {
      return NextResponse.json(
        { success: false, message: "Server not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Server deleted successfully.",
        data: { server },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("DELETE_SERVER_ERROR", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the server.",
      },
      {
        status: 500,
      }
    );
  }
};
