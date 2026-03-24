"use client";

import { useEffect, useState, useRef, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "./CommunityContext";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ShieldAlert, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { messageApi } from "@/lib/api-modules";
import { TestBuilder } from "./TestBuilder";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
  action?: {
    type?: "take_test";
    label?: string;
    href?: string;
    testId?: string;
  };
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shouldShowDateSeparator(
  messages: Message[],
  index: number
): boolean {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].timestamp).toDateString();
  const curr = new Date(messages[index].timestamp).toDateString();
  return prev !== curr;
}

export function ChatBox() {
  const router = useRouter();
  const { community, userRole } = useCommunity();
  const { user, firebaseUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const latestTimestampRef = useRef<string | null>(null);

  const currentUserId =
    user?.id || (user as any)?._id || firebaseUser?.uid || "";
  const currentUserName =
    (user as any)?.displayName ||
    firebaseUser?.displayName ||
    (user as any)?.name ||
    "You";

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
      });
    }, 50);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!community?._id) return;
    try {
      const data = await messageApi.getMessages(community._id, 100);
      const fetched: Message[] = data.messages || [];
      setMessages(fetched);
      latestTimestampRef.current =
        fetched.length > 0 ? fetched[fetched.length - 1].timestamp : null;
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        scrollToBottom(false);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [community?._id, scrollToBottom]);

  const fetchNewMessages = useCallback(async () => {
    if (!community?._id || !latestTimestampRef.current) return;
    try {
      const data = await messageApi.getMessages(
        community._id,
        100,
        latestTimestampRef.current
      );
      const incoming: Message[] = data.messages || [];
      if (incoming.length === 0) return;

      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m._id));
        const uniqueIncoming = incoming.filter((m) => !seen.has(m._id));
        if (uniqueIncoming.length === 0) return prev;
        return [...prev, ...uniqueIncoming];
      });

      latestTimestampRef.current = incoming[incoming.length - 1].timestamp;
      scrollToBottom();
    } catch (err) {
      console.error("Failed to fetch incremental messages:", err);
    }
  }, [community?._id, scrollToBottom]);

  // Initial fetch + fast polling for near-realtime chat updates
  useEffect(() => {
    if (!community?._id) {
      setMessages([]);
      latestTimestampRef.current = null;
      return;
    }

    isFirstLoad.current = true;
    fetchMessages();

    const interval = setInterval(() => {
      if (isFirstLoad.current) {
        fetchMessages();
      } else {
        fetchNewMessages();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [community?._id, fetchMessages, fetchNewMessages]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !community || sending) return;

    const isAdmin = userRole === "admin" || userRole === "owner";
    if (!community.allowUsersToChat && !isAdmin) {
      toast.error("Chat is disabled for members.");
      return;
    }

    const textToSend = inputText.trim();
    setInputText("");

    // Optimistic update
    const optimisticMsg: Message = {
      _id: `temp-${Date.now()}`,
      senderId: String(currentUserId),
      senderName: currentUserName,
      text: textToSend,
      timestamp: new Date().toISOString(),
      isSystem: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      setSending(true);
      await messageApi.sendMessage(community._id, textToSend);
      // Refetch to get the real message with proper _id
      await fetchMessages();
      scrollToBottom();
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error(
        `Failed to send message: ${err?.message || "Unknown error"}`
      );
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  const isAdmin = userRole === "admin" || userRole === "owner";
  const chatDisabled = !community?.allowUsersToChat && !isAdmin;
  const canCreateTest = isAdmin || community?.allowTestCreation;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950/60">
      {/* Chat Background */}
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full w-full flex-1"
      >
        <div className="px-4 py-8 space-y-1 flex flex-col min-h-full">
          {/* Admin-only chat notice */}
          {!community?.allowUsersToChat && (
            <div className="flex justify-center my-4">
              <div className="bg-zinc-900 text-zinc-400 text-xs px-4 py-2 rounded-lg text-center shadow-sm flex items-center gap-1.5 border border-zinc-800">
                <ShieldAlert className="w-4 h-4" /> Only admins can send
                messages
              </div>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-400">
              <div className="bg-zinc-900 rounded-full p-6 mb-4 shadow border border-zinc-800">
                <MessageSquare className="w-12 h-12 text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-zinc-200">
                No messages yet
              </p>
              <p className="text-xs mt-1">
                Start a conversation below
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => {
            const isMe = String(msg.senderId) === String(currentUserId);
            const showDate = shouldShowDateSeparator(messages, index);

            // Check if consecutive messages are from the same sender
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isSameSenderAsPrev =
              prevMsg &&
              !prevMsg.isSystem &&
              !msg.isSystem &&
              prevMsg.senderId === msg.senderId &&
              !showDate;

            return (
              <div key={msg._id} className="flex flex-col">
                {/* Date separator */}
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-zinc-900 text-zinc-400 text-[11px] px-3 py-1.5 rounded-lg font-medium shadow-sm border border-zinc-800">
                      {formatDateSeparator(msg.timestamp)}
                    </span>
                  </div>
                )}

                {/* System message */}
                {msg.isSystem ? (
                  <div className="flex justify-center my-3">
                    <div className="bg-zinc-900 text-zinc-100 px-4 py-3 rounded-xl text-center shadow-sm max-w-sm w-full sm:w-auto border border-zinc-800">
                      <div className="text-zinc-300 font-semibold mb-1 text-[12px] uppercase tracking-wide">
                        Community Update
                      </div>
                      <div className="text-[13.5px] leading-relaxed text-zinc-300 break-all [overflow-wrap:anywhere]">{msg.text}</div>

                      {msg.action?.type === "take_test" && (msg.action.href || msg.action.testId) && (
                        <div className="mt-3">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full px-5 font-semibold border-0 shadow-none"
                            onClick={() => {
                              const href = msg.action?.href || `/communities/${community?._id}/tests/${msg.action?.testId}`;
                              router.push(href);
                            }}
                          >
                            {msg.action.label || "Take Test"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* User message */
                  <div
                    className={`flex items-end gap-2 relative ${
                      isSameSenderAsPrev ? "mt-0.5" : "mt-2"
                    } ${isMe ? "self-end pr-2 md:pr-10" : "self-start pl-2 md:pl-10"}`}
                  >
                    {/* Optional avatar on left for others */}
                    {/* Removing avatar entirely to make it exactly like WhatsApp Web where group chats just show colored names */}

                    <div
                      className={`relative w-fit max-w-[84vw] sm:max-w-[70vw] lg:max-w-[58vw] px-2.5 py-1.5 text-[14.5px] leading-[21px] shadow-sm flex flex-col ${
                        isMe
                          ? `bg-zinc-800 text-zinc-100 rounded-lg ${!isSameSenderAsPrev ? 'rounded-tr-none' : ''}`
                          : `bg-zinc-900 text-zinc-100 rounded-lg border border-zinc-800 ${!isSameSenderAsPrev ? 'rounded-tl-none' : ''}`
                      }`}
                    >
                      {/* Name for others */}
                      {!isMe && !isSameSenderAsPrev && (
                        <span className="text-[13px] text-zinc-300 font-medium mb-0.5 leading-tight cursor-pointer hover:underline">
                          {msg.senderName}
                        </span>
                      )}

                      <div className="flex flex-wrap items-end justify-between gap-3 min-w-[70px]">
                        <span className="break-all whitespace-pre-wrap [overflow-wrap:anywhere]">{msg.text}</span>
                        <span className="text-[11px] text-zinc-400 shrink-0 float-right translate-y-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      
                      {/* Tail arrow SVG for first message in block */}
                      {!isSameSenderAsPrev && (
                        <svg
                          viewBox="0 0 8 13"
                          width="8"
                          height="13"
                          className={`absolute top-0 ${isMe ? "text-zinc-800 -right-2" : "text-zinc-900 -left-2"}`}
                        >
                          {isMe ? (
                            <path opacity="1" fill="currentColor" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                          ) : (
                            <path opacity="1" fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                          )}
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} className="h-6" />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="relative z-20 w-full shrink-0 bg-zinc-900/95 border-t border-zinc-800 px-4 py-3 sm:px-6 md:px-10 flex items-center justify-center">
        <div className="flex items-center gap-3 w-full max-w-5xl">
          {canCreateTest && (
            <div className="shrink-0 bg-transparent">
               <TestBuilder onTestCreated={() => {}} />
            </div>
          )}
          <form onSubmit={handleSend} className="flex-1 flex items-center bg-zinc-900 rounded-lg px-4 py-2 min-h-11 shadow-sm border border-zinc-800">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={chatDisabled}
              placeholder={
                chatDisabled
                  ? "Only admins can send messages"
                  : "Type a message"
              }
              className="bg-transparent border-none w-full text-[15px] text-zinc-200 placeholder:text-zinc-500 focus:ring-0 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </form>
          {inputText.trim() && !chatDisabled && !sending && (
             <Button
               type="submit"
               onClick={handleSend}
               className="h-11 w-11 shrink-0 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-all shadow-none border-0 p-0 flex items-center justify-center"
             >
               <Send className="w-5 h-5 ml-1" />
             </Button>
          )}
        </div>
      </div>
    </div>
  );
}
