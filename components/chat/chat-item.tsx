"use client";
import { FileType, Member, MemberRole, Profile } from "@prisma/client";
import React, { useEffect, useState } from "react";
import UserAvatar from "../user-avatar";
import ActionTooltip from "../action-tooltip";
import {
  EditIcon,
  FileIcon,
  ShieldAlert,
  ShieldCheck,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { editMessageSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/hooks/use-modal-store";
import { useParams, useRouter } from "next/navigation";

interface ChatItemProps {
  id: string;
  member: Member & {
    profile: Profile;
  };
  content: string;
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  fileType: FileType;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 ml-2 text-red-500" />,
};

const ChatItem = ({
  id,
  member,
  content,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
  fileType,
}: ChatItemProps) => {
  const { toast } = useToast();
  const { onOpen } = useModal();
  const router = useRouter();
  const params = useParams();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = member.role === MemberRole.ADMIN;
  const isModerator = member.role === MemberRole.MODERATOR;
  const isOwner = member.id === currentMember.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && !fileUrl && isOwner;
  const isPdf = fileType === FileType.PDF && fileUrl;
  const isImage = fileType === FileType.IMAGE && fileUrl;

  const form = useForm<z.infer<typeof editMessageSchema>>({
    defaultValues: {
      content: content,
    },
    resolver: zodResolver(editMessageSchema),
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (formData: z.infer<typeof editMessageSchema>) => {
    try {
      await axios.patch(
        `${socketUrl}/${id}?query=${JSON.stringify(socketQuery)}`,
        formData
      );
      form.reset();
      setIsEditing(false);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      // Handle error based on the specific API error
      toast({
        title: "Error",
        description: (axiosError.response?.data as { message: string })
          ?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-2 items-start w-full">
        <div
          className="cursor-pointer hover:drop-shadow-md transition"
          onClick={onMemberClick}
        >
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                className="font-semibold text-sm hover:underline cursor-pointer "
                onClick={onMemberClick}
              >
                {member.profile.name}
              </p>
              <ActionTooltip label={member.role}>
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt="content"
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPdf && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-14 w-14 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline flex"
              >
                <span className="ml-2">PDF File</span>
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edit your message"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size={"sm"} variant={"primary"}>
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <EditIcon
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-500 transition"
                onClick={() => setIsEditing(true)}
              />
            </ActionTooltip>
          )}
          {canDeleteMessage && (
            <ActionTooltip label="Delete">
              <Trash
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-500 transition"
                onClick={() =>
                  onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery,
                  })
                }
              />
            </ActionTooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatItem;
