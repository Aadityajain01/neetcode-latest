"use client";

import { ChatBox } from "@/components/communities/ChatBox";

export default function ChatPage() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1 relative flex flex-col w-full h-full">
        <ChatBox />
      </div>
    </div>
  );
}
