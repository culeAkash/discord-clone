"use client";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Smile } from "lucide-react";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";

interface EmojipickerProps {
  onChange: (value: string) => void;
}

type Emoji = {
  native: string;
};

const EmojiPicker = ({ onChange }: EmojipickerProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          theme={resolvedTheme}
          onEmojiSelect={(emoji: Emoji) => onChange(emoji.native)}
          data={data}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
