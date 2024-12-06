import { currentProfile } from "@/lib/current-profile-pages";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { NextApiResponseServerIO } from "../../../../utils/types";
import { db } from "@/lib/db";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponseServerIO
) {
  if (request.method !== "DELETE" && request.method !== "PATCH") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfile(request);

    const { directMessageId, query } = request.query;

    const { conversationId } = JSON.parse(query as string);

    const { content } = request.body;

    // console.log("DELETE_MESSAGE", directMessageId, conversationId);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (!directMessageId || !conversationId) {
      return response.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return response.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return response.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return response.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const isMessageOwner = directMessage.memberId === member.id;
    const canModifyMessage = isMessageOwner;

    if (!canModifyMessage) {
      return response.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.method === "DELETE") {
      // console.log("DELETE MESSAGE", directMessage);
      directMessage = await db.directMessage.update({
        where: { id: directMessageId as string },
        data: {
          fileUrl: null,
          content: "This message has been deleted",
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    if (request.method === "PATCH") {
      if (!isMessageOwner) {
        return response.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // console.log("PATCH MESSAGE CONTENT", messageId, message.id, content);

      directMessage = await db.directMessage.update({
        where: { id: directMessageId as string },
        data: { content },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
      // console.log("PATCH MESSAGE", updatedMessage);
    }

    const updateKey = `chat:${conversation.id}:messages:update`;

    response?.socket?.server?.io?.emit(updateKey, directMessage);

    return response.status(200).json({
      success: true,
      message: "Message updated successfully",
    });
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return response.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
