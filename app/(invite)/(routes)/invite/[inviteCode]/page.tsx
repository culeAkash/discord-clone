import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
interface InviteCodeProps {
  params: Promise<{ inviteCode: string }>;
}

const InviteCodePage = async ({ params }: InviteCodeProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/sign-in");
  }
  const { inviteCode } = await params;
  if (!inviteCode) {
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: inviteCode,
      members: { some: { profileId: profile.id } },
    },
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await db.server.update({
    where: {
      inviteCode: inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) return redirect(`/servers/${server.id}`);

  return null;
};

export default InviteCodePage;
