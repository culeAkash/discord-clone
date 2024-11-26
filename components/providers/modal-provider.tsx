"use client";
import React, { useEffect, useState } from "react";
import CreateServerModal from "../modals/create-server-modal";
import InviteMemberModal from "../modals/invite-modal";
import EditServerModal from "../modals/edit-server-modal";
import ManageMembersModal from "../modals/manage-members-modal";
import CreateChannel from "../modals/create-channel";
import LeaveServerModal from "../modals/leave-server-modal";
import DeleteServerModal from "../modals/delete-server-modal";
import DeleteChannelModal from "../modals/delete-channel-modal";
import EditChannelModal from "../modals/edit-channel-modal";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <CreateServerModal />
      <InviteMemberModal />
      <EditServerModal />
      <ManageMembersModal />
      <CreateChannel />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
    </>
  );
};

export default ModalProvider;
