"use client";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { channelCreationSchema } from "@/utils/schema";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChannelType } from "@prisma/client";

const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { toast } = useToast();
  const router = useRouter();
  const { server, channel, channelType } = data;
  const form = useForm({
    resolver: zodResolver(channelCreationSchema),
    defaultValues: {
      name: "",
      type: channelType!,
    },
  });

  useEffect(() => {
    if (channel && channelType) {
      form.setValue("name", channel?.name);
      form.setValue("type", channelType);
    }
  }, [channel, channelType, form, server]);

  const isModalOpen = isOpen && type === "editChannel";

  const handleClose = () => {
    onClose();
  };

  const { isSubmitting: isLoading } = form.formState;

  const onSubmit = async (formData: z.infer<typeof channelCreationSchema>) => {
    try {
      await axios.patch(
        `/api/channel/edit/${channel?.id}?serverId=${server?.id}`,
        {
          name: formData.name,
          type: formData.type,
        }
      );
      router.refresh();
      onClose();
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
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Name :{" "}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className=" border-0 focus-visible:ring-0 bg-zinc-300/50 focus-visible:ring-offset-0"
                        disabled={isLoading}
                        placeholder="Enter a name for your channel..."
                        {...field}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel Type :{" "}
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Channel Types</SelectLabel>
                          {Object.values(ChannelType).map((channelType) => (
                            <SelectItem
                              key={channelType}
                              value={channelType}
                              className="capitalize"
                            >
                              {channelType.toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading} variant={"primary"}>
                Update Channel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;
