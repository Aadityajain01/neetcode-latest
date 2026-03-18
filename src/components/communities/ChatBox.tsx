"use client";

import { useEffect, useState, useRef, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "./CommunityContext";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ShieldAlert, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { messageApi } from "@/lib/api-modules";
import { format } from "date-fns";
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

// Generate a consistent color from a string (sender name)
function getAvatarColor(name: string): string {
  const colors = [
    "#10b981", // emerald
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      {/* Chat Background */}
      <ScrollArea
        ref={scrollAreaRef}
        className="h-full w-full flex-1"
      >
        <div className="p-4 space-y-1 flex flex-col min-h-full">
          {/* Admin-only chat notice */}
          {!community?.allowUsersToChat && (
            <div className="flex justify-center my-4">
              <div className="bg-amber-500/10 text-amber-500 text-xs px-4 py-1.5 rounded-full text-center border border-amber-500/20 flex items-center gap-1.5 backdrop-blur-sm">
                <ShieldAlert className="w-3 h-3" /> Only admins can send
                messages
              </div>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-600">
              <div className="bg-zinc-800/30 rounded-full p-6 mb-4">
                <MessageSquare className="w-12 h-12 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                No messages yet
              </p>
              <p className="text-xs text-zinc-600 mt-1">
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
              <div key={msg._id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-zinc-800/80 text-zinc-400 text-[10px] px-3 py-1 rounded-md font-medium uppercase tracking-wider backdrop-blur-sm">
                      {formatDateSeparator(msg.timestamp)}
                    </span>
                  </div>
                )}

                {/* System message */}
                {msg.isSystem ? (
                  <div className="flex justify-center my-3">
                    <div className="bg-zinc-900/85 text-zinc-100 text-xs px-4 py-3 rounded-xl text-center border border-zinc-700/70 max-w-sm backdrop-blur-sm shadow-md w-full sm:w-auto">
                      <div className="text-emerald-400 font-semibold mb-1 tracking-wide text-[11px] uppercase">
                        Community Update
                      </div>
                      <div className="text-sm text-zinc-200">{msg.text}</div>

                      {msg.action?.type === "take_test" && (msg.action.href || msg.action.testId) && (
                        <div className="mt-3">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4"
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
                  /* User message — Minimal style */
                  <div
                    className={`flex items-end gap-2 ${
                      isSameSenderAsPrev ? "mt-1" : "mt-4"
                    } ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    {!isSameSenderAsPrev && !isMe ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                        style={{
                          backgroundColor: getAvatarColor(msg.senderName),
                        }}
                      >
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      !isMe && <div className="w-8 shrink-0" />
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender name — only for other users on first message in group */}
                      {!isMe && !isSameSenderAsPrev && (
                        <p className="text-[11px] font-medium text-zinc-400 mb-1 ml-1">
                          {msg.senderName}
                        </p>
                      )}

                      <div
                        className={`relative px-4 py-2.5 text-sm leading-relaxed shadow-sm rounded-2xl ${
                          isMe
                            ? "bg-zinc-800 text-white"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-100"
                        }`}
                      >
                        <span>{msg.text}</span>
                        <span
                          className={`text-[10px] ml-3 inline-block align-bottom translate-y-[2px] ${
                            isMe ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="relative z-20 w-full shrink-0 bg-transparent p-4 sm:px-6 mb-2">
        <div className="flex items-center gap-3 relative w-full h-full">
          {canCreateTest && (
            <div className="shrink-0">
              <TestBuilder onTestCreated={() => {}} />
            </div>
          )}
          <form onSubmit={handleSend} className="flex-1 flex items-center relative h-12">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={chatDisabled}
            placeholder={
              chatDisabled
                ? "Chat is disabled for members"
                : "Type a message..."
            }
            className="bg-zinc-900/40 border-zinc-800/80 focus-visible:ring-emerald-500/30 w-full text-base h-full rounded-full pl-5 pr-14 placeholder:text-zinc-500 transition-colors shadow-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="submit"
            disabled={chatDisabled || !inputText.trim() || sending}
            className="absolute right-1 top-1 h-10 w-10 shrink-0 rounded-full bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-none"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
}
