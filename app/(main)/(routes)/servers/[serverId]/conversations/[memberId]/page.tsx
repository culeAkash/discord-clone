import ChatHeader from "@/components/chat/chat-header";
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
}

const ConversationMemberIdPage = async ({
  params,
}: ConversationMemberIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const { memberId, serverId } = await params;

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
    </div>
  );
};

export default ConversationMemberIdPage;
