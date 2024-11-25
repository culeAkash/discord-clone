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

const DeleteServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "deleteServer";
  const { toast } = useToast();
  const router = useRouter();

  const server = data.server;

  const [isLoading, setIsLoading] = useState(false);

  const onDeleteServer = async () => {
    try {
      setIsLoading(true);
      // send request to leave server
      await axios.patch(`/api/server/${server?.id}/delete`);
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
            Delete Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500 text-md">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-indigo-500">
              {server?.name}
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
              onClick={onDeleteServer}
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

export default DeleteServerModal;
