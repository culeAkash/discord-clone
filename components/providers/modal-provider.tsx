"use client";
import React, { useEffect, useState } from "react";
import CreateServerModal from "../modals/create-server-modal";
import InviteMemberModal from "../modals/invite-modal";
import EditServerModal from "../modals/edit-server-modal";

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
    </>
  );
};

export default ModalProvider;
