"use client";

import { useToast } from "@/hooks/use-toast";
import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import React from "react";

interface fileUploadProps {
  endpoint: "messageFile" | "serverImage";
  value: string;
  onChange: (url?: string) => void;
}

const FileUpload = ({ endpoint, value, onChange }: fileUploadProps) => {
  const { toast } = useToast();

  const fileType = value.split(".").pop();

  if (value && fileType !== "pdf") {
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
  return (
    <UploadDropzone
      endpoint={endpoint}
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
