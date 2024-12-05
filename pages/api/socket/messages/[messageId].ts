import { currentProfile } from "@/lib/current-profile-pages";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { NextApiResponseServerIO } from "../../../../utils/types";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponseServerIO
) {
  if (request.method !== "DELETE" && request.method !== "PATCH") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfile(request);

    const { messageId, serverId, channelId } = request.query;

    const { content } = request.body;

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

    if (!messageId || !serverId || !channelId) {
      return response.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return response.status(404).json({
        success: false,
        message: "Server not found",
      });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: server.id as string,
      },
    });

    if (!channel) {
      return response.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return response.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const message = await db.message.findFirst({
      where: { id: messageId as string, channelId: channelId as string },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return response.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModifyMessage = isMessageOwner || isAdmin || isModerator;

    if (!canModifyMessage) {
      return response.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (request.method === "DELETE") {
      await db.message.update({
        where: { id: messageId as string },
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

      await db.message.update({
        where: { id: message.id },
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

    const updateKey = `chat:${channelId}:messages:update`;

    response?.socket?.server?.io?.emit(updateKey, message);

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
