import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { serverCreationSchema } from "@/utils/schema";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ serverId: string }>;
export const PATCH = async (
  request: NextRequest,
  segmentData: { params: Params }
) => {
  const params = await segmentData.params;
  //   console.log(params);

  const serverId = params.serverId;
  //   console.log(serverId);

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

  try {
    const data = await request.json(); // get the data from the request body

    const result = serverCreationSchema.safeParse(data);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        {
          status: 400,
        }
      );
    }
    const { name, imageUrl } = result.data;
    const server = await db.server.update({
      where: { id: serverId, profileId: profile.id },
      data: {
        name,
        imageUrl,
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
        message: "Server updated successfully.",
        data: { server },
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
        message: "Failed to update server.",
      },
      {
        status: 500,
      }
    );
  }
};
