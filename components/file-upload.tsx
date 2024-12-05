"use client";

import { useToast } from "@/hooks/use-toast";
import { UploadDropzone } from "@/lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import React from "react";

interface fileUploadProps {
  endpoint: "messageFile" | "serverImage";
  value: string;
  onChange: (url?: string) => void;
  isPdf?: boolean;
  setIsPdf?: (isPdf: boolean) => void;
}

const FileUpload = ({
  endpoint,
  value,
  onChange,
  isPdf,
  setIsPdf,
}: fileUploadProps) => {
  const { toast } = useToast();

  if (value && !isPdf) {
    return (
      <div className="relative h-36 w-36">
        <Image fill src={value} alt="Upload" className="rounded-full" />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // console.log(value, fileType);

  if (value && isPdf) {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          <FileIcon className="h-20 w-20 fill-indigo-200 stroke-indigo-400" />
        </a>
        <button
          onClick={() => {
            onChange("");
          }}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onUploadBegin={(name) => {
        // console.log(name);
        const type = name.split(".").pop() || "";
        if (type === "pdf") {
          if (isPdf && setIsPdf) setIsPdf(true);
        }
      }}
      onClientUploadComplete={(response) => onChange(response?.[0]?.url)}
      onUploadError={(error) => {
        if (error.code === "BAD_REQUEST") {
          toast({
            title: "Error",
            description: "Please check your file size and try again.",
            variant: "destructive",
          });
        }
      }}
    />
  );
};

export default FileUpload;
