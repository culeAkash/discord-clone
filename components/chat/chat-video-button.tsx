"use client";

import React from "react";
import ActionTooltip from "../action-tooltip";
import { Video, VideoOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ChatVideoButton = () => {
  const pathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams();
  const isVideo = searchParams?.get("video");

  console.log(isVideo);

  const Icon = isVideo !== "undefined" ? VideoOff : Video;
  const toolTipLabel =
    isVideo !== "undefined" ? "End Video call" : "Start Video call";

  const onClick = () => {
    const url = `${pathname}?video=${
      isVideo !== "undefined" ? undefined : true
    }`;
    router.replace(url);
  };

  return (
    <ActionTooltip side="bottom" label={toolTipLabel}>
      <button onClick={onClick} className="hover:opacity-75 transition mr-4">
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};

export default ChatVideoButton;
