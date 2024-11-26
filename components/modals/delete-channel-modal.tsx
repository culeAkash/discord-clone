"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";

import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "deleteChannel";
  const { toast } = useToast();
  const router = useRouter();

  const { channel, server } = data;

  const [isLoading, setIsLoading] = useState(false);

  const onDeleteChannel = async () => {
    try {
      setIsLoading(true);
      // send request to leave server
      await axios.delete(
        `/api/channel/delete/${channel?.id}?serverId=${server?.id}`
      );
      onClose();
      router.refresh();
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
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 text-md">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-indigo-500">
              {channel?.name}
            </span>{" "}
            ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button variant={"ghost"} onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant={"primary"}
              onClick={onDeleteChannel}
              disabled={isLoading}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
