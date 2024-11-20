import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { serverCreationSchema } from "@/utils/schema";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export const POST = async (request: NextRequest) => {
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
  try {
    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [
            {
              name: "general",
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Server created successfully!",
        data: { server },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      message: "Failed to create server. Please try again.",
    });
  }

  // save the server to your database or use any other method to store it
};
