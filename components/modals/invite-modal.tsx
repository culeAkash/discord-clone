"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";

const InviteMemberModal = () => {
  const { onOpen, isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "inviteMember";
  const { toast } = useToast();

  const origin = useOrigin();

  const server = data.server;

  const inviteUrl = `${origin}  ${server?.inviteCode}`;

  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000); // reset after 1 second
  };

  const onGenerateNew = async () => {
    // implement logic to generate new invite code

    try {
      setIsLoading(true);
      // send request to generate new invite code
      const response = await axios.patch(
        `/api/server/${server?.id}/invite-code`
      );
      onOpen("inviteMember", { server: response.data.data.server });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log(axiosError);
      toast({
        title: "Error",
        description: (axiosError.response?.data as { message: string })
          ?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server Invite Link :{" "}
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
              disabled
            />
            <Button disabled={isLoading} size={"icon"} onClick={onCopy}>
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            disabled={isLoading}
            onClick={onGenerateNew}
            variant={"link"}
            size={"sm"}
            className="text-xs text-zinc-500 mt-4"
          >
            Generate a new link
            <RefreshCw className="w-2 h-2 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
