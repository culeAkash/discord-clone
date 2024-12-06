import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { MessageWithMembersWithProfiles } from "../utils/types";

type ChatSocketProps = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

export const useChatSocket = ({
  addKey,
  queryKey,
  updateKey,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on(updateKey, (message: MessageWithMembersWithProfiles) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return oldData;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newData = oldData.pages.map((page: any) => {
          console.log(page);
          return {
            ...page,
            data: {
              ...page.data,
              messages: page.data.messages.map(
                (item: MessageWithMembersWithProfiles) => {
                  if (item.id === message.id) {
                    return message;
                  }
                  return item;
                }
              ),
            },
          };
        });
        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    socket.on(addKey, (message: MessageWithMembersWithProfiles) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData([queryKey], (oldData: any) => {
        // console.log(oldData);

        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                success: true,
                messages: [message],
              },
            ],
          };
        }
        const newData = [...oldData.pages];
        // console.log(newData[0]);

        newData[0] = {
          ...newData[0],
          data: {
            messages: [message, ...newData[0].data.messages],
          },
        };
        return {
          ...oldData,
          pages: newData,
        };
      });
    });

    return () => {
      socket.off(updateKey);
      socket.off(addKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
