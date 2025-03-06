import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/initial-conversation";
import { redirect } from "next/navigation";
import React from "react";

interface ConversationMemberIdPageProps {
  params: Promise<{
    memberId: string;
    serverId: string;
  }>;
  searchParams: Promise<{ video: string }>;
}

const ConversationMemberIdPage = async ({
  params,
  searchParams,
}: ConversationMemberIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const { memberId, serverId } = await params;
  const { video } = await searchParams;

  // console.log(typeof video);

  const isVideo = video === "true" ? true : false;

  // console.log(isVideo);

  const currentMember = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId
  );

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        serverId={serverId}
        name={otherMember.profile.name}
        type="conversation"
        imageUrl={otherMember.profile.imageUrl}
      />
      {!isVideo && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
      {isVideo && (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      )}
    </div>
  );
};

export default ConversationMemberIdPage;
