"use client";
import { chatSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { useModal } from "@/hooks/use-modal-store";
import EmojiPicker from "./emoji-picker";
import { useRouter } from "next/navigation";

interface ChatInputProps {
  apiUrl: string;
  query: Record<string, string>;
  name: string;
  type: "conversation" | "channel";
}

const ChatInput = ({ query, apiUrl, name, type }: ChatInputProps) => {
  const { onOpen } = useModal();
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      content: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (formData: z.infer<typeof chatSchema>) => {
    try {
      await axios.post(`${apiUrl}`, formData, {
        params: query,
      });
      form.reset();
      router.refresh();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      onOpen("messageFile", {
                        apiUrl,
                        query,
                      });
                    }}
                    className="absolute top-6 left-8 w-[24px] h-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>
                  <Input
                    disabled={isLoading}
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    {...field}
                    className="px-14 py-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                  />
                  <div className="absolute top-6 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value}${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatInput;
