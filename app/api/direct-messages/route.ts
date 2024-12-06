import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
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
    const conversationId = searchParams.get("conversationId");

    if (!cursor || !conversationId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let messages: DirectMessage[] = [];

    if (cursor !== "undefined") {
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
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
      messages = await db.directMessage.findMany({
        take: MESSAGES_BATCH,
        where: {
          conversationId,
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
