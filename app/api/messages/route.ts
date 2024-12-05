import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const MESSAGES_BATCH = 10;

export const GET = async (request: NextRequest) => {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!cursor || !channelId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let messages: Message[] = [];

    if (cursor !== "undefined") {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId: channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId: channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // console.log(searchParams, cursor, channelId, messages);
    let nextCursor = null;

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[messages.length - 1].id;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          messages,
          nextCursor,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("[MESSAGES_GET_ERROR]", error);
    return new NextResponse("Something went wrong", { status: 500 });
  }
};
