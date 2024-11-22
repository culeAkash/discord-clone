import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
type Params = Promise<{ serverId: string }>;
export const PATCH = async (
  request: NextRequest,
  segmentData: { params: Params }
) => {
  const params = await segmentData.params;
  //   console.log(params);

  const serverId = params.serverId;
  //   console.log(serverId);

  if (!serverId) {
    return NextResponse.json(
      {
        success: false,
        message: "Server ID is required.",
      },
      {
        status: 400,
      }
    ); // Bad Request
  }
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to create a server.",
        },
        {
          status: 401,
        }
      );
    }

    const server = await db.server.update({
      where: { id: serverId, profileId: profile.id },
      data: {
        inviteCode: uuidv4(),
      },
    });

    if (!server) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update server, Server not found.",
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Invite code updated successfully.",
        data: {
          server,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update server, Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
};
