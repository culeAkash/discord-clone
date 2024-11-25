import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const handleAuth = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new UploadThingError({
      message: "Not Authenticated",
      code: "FORBIDDEN",
    });
  }
  return { userId };
};

export const ourFileRouter = {
  serverImage: f({
    image: { maxFileSize: "4MB", minFileCount: 1, maxFileCount: 1 },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(async ({}) => {}),
  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(async ({}) => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
