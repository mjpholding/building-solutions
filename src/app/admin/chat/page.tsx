"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Send,
  Paperclip,
  Hash,
  Users,
  Plus,
  Shield,
  Trash2,
  X,
  Menu,
  Loader2,
  Image as ImageIcon,
  FileText,
  Languages,
} from "lucide-react";

interface ChatUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface Channel {
  id: string;
  name: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  file?: string;
  fileName?: string;
  fileType?: string;
  timestamp: number;
}

function userColor(id: string): string {
  const colors = ["#dc2626","#2563eb","#16a34a","#9333ea","#ea580c","#0891b2","#be185d","#4f46e5"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrenUser] = useState<ChatUser | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChatUser[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<string | null>(null);
  const [userLang, setUserLang] = useState<"de" | "pl">("de");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestTimestampRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load last-read timestamps from localStorage
  const getLastRead = useCallback((channelId: string): number => {
    try {
      const data = localStorage.getItem("chat-last-read");
      if (data) {
        const parsed = JSON.parse(data);
        return parsed[channelId] || 0;
      }
    } catch { /* ignore */ }
    return 0;
  }, []);

  const setLastRead = useCallback((channelId: string, ts: number) => {
    try {
      const data = localStorage.getItem("chat-last-read");
      const parsed = data ? JSON.parse(data) : {};
      parsed[channelId] = ts;
      localStorage.setItem("chat-last-read", JSON.stringify(parsed));
    } catch { /* ignore */ }
  }, []);

  // Verify session via admin auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/chat/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setCurrenUser(data.user);
        setMembers(data.members);
        setLoading(false);
      } catch {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  // Load channels
  useEffect(() => {
    if (loading) return;

    const loadChannels = async () => {
      try {
        const res = await fetch("/api/admin/chat/channels");
        if (res.ok) {
          const data: Channel[] = await res.json();
          setChannels(data);
          if (!activeChannel && data.length > 0) {
            setActiveChannel(data[0].id);
          }
        }
      } catch { /* ignore */ }
    };

    loadChannels();
  }, [loading, activeChannel]);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `/api/admin/chat/messages?channel=${activeChannel}`
        );
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
          if (data.length > 0) {
            latestTimestampRef.current = data[data.length - 1].timestamp;
            setLastRead(activeChannel, data[data.length - 1].timestamp);
          } else {
            latestTimestampRef.current = 0;
          }
          // Update unread for this channel to 0
          setUnreadCounts((prev) => ({ ...prev, [activeChannel]: 0 }));
          setTimeout(scrollToBottom, 100);
        }
      } catch { /* ignore */ }
    };

    loadMessages();
  }, [activeChannel, scrollToBottom, setLastRead]);

  // Poll for new messages
  useEffect(() => {
    if (!activeChannel) return;

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(async () => {
      try {
        // Poll active channel
        const res = await fetch(
          `/api/admin/chat/messages?channel=${activeChannel}&after=${latestTimestampRef.current}`
        );
        if (res.ok) {
          const newMsgs: Message[] = await res.json();
          if (newMsgs.length > 0) {
            setMessages((prev) => [...prev, ...newMsgs]);
            latestTimestampRef.current =
              newMsgs[newMsgs.length - 1].timestamp;
            setLastRead(activeChannel, newMsgs[newMsgs.length - 1].timestamp);
            setTimeout(scrollToBottom, 100);
          }
        }

        // Check unread for other channels
        for (const ch of channels) {
          if (ch.id === activeChannel) continue;
          const lr = getLastRead(ch.id);
          const chRes = await fetch(
            `/api/admin/chat/messages?channel=${ch.id}&after=${lr}`
          );
          if (chRes.ok) {
            const chMsgs: Message[] = await chRes.json();
            if (chMsgs.length > 0) {
              setUnreadCounts((prev) => ({
                ...prev,
                [ch.id]: chMsgs.length,
              }));
            }
          }
        }
      } catch { /* ignore */ }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChannel, channels, scrollToBottom, getLastRead, setLastRead]);

  // Send message
  const handleSend = async (fileUrl?: string, fileName?: string, fileType?: string) => {
    const text = input.trim();
    if (!text && !fileUrl) return;

    setSending(true);
    try {
      const body: Record<string, string> = { channel: activeChannel };
      if (text) body.text = text;
      if (fileUrl) {
        body.file = fileUrl;
        if (fileName) body.fileName = fileName;
        if (fileType) body.fileType = fileType;
      }

      const res = await fetch("/api/admin/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => [...prev, msg]);
        latestTimestampRef.current = msg.timestamp;
        setLastRead(activeChannel, msg.timestamp);
        setInput("");
        setTimeout(scrollToBottom, 100);
        inputRef.current?.focus();
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", `chat-${Date.now()}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await handleSend(data.url, file.name, file.type);
      }
    } catch { /* ignore */ }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Create channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const res = await fetch("/api/admin/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannelName.trim() }),
      });

      if (res.ok) {
        const ch: Channel = await res.json();
        setChannels((prev) => [...prev, ch]);
        setActiveChannel(ch.id);
        setNewChannelName("");
        setShowNewChannel(false);
      }
    } catch { /* ignore */ }
  };

  // Delete channel
  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Kanal wirklich löschen?")) return;

    try {
      const res = await fetch("/api/admin/chat/channels", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setChannels((prev) => prev.filter((c) => c.id !== id));
        if (activeChannel === id) {
          setActiveChannel(channels.find((c) => c.id !== id)?.id || "");
        }
      }
    } catch { /* ignore */ }
  };

  // Format time
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Check if we need a date separator
  const needsDateSeparator = (current: Message, previous?: Message) => {
    if (!previous) return true;
    const d1 = new Date(current.timestamp).toDateString();
    const d2 = new Date(previous.timestamp).toDateString();
    return d1 !== d2;
  };

  // Get initials
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  // Translate message with timeout protection
  const handleTranslate = async (msgId: string, text: string) => {
    if (translations[msgId] || !text.trim()) return;
    setTranslating(msgId);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/admin/chat/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: userLang }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data.translation) {
          setTranslations((prev) => ({ ...prev, [msgId]: data.translation }));
        } else {
          setTranslations((prev) => ({ ...prev, [msgId]: "—" }));
        }
      } else {
        setTranslations((prev) => ({ ...prev, [msgId]: "⚠ Fehler" }));
      }
    } catch {
      setTranslations((prev) => ({ ...prev, [msgId]: "⚠ Timeout" }));
    }
    setTranslating(null);
  };

  // Check if file is an image
  const isImage = (fileType?: string) =>
    fileType?.startsWith("image/") || false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const activeChannelName =
    channels.find((c) => c.id === activeChannel)?.name || "";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-8 -mt-8">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <Hash size={20} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">{activeChannelName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUserLang(userLang === "de" ? "pl" : "de")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            title={userLang === "de" ? "Übersetze nach Deutsch" : "Tłumacz na polski"}
          >
            <Languages size={14} className="text-gray-500" />
            {userLang === "de" ? "→ DE" : "→ PL"}
          </button>
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <Users size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Channels */}
        <aside
          className={`${
            leftOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 absolute lg:relative z-20 w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 h-full transition-transform duration-200`}
        >
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-red-500" />
              <span className="font-semibold text-sm">Kanäle</span>
            </div>
            <button
              onClick={() => setLeftOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-800 rounded"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  activeChannel === ch.id
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => {
                  setActiveChannel(ch.id);
                  setLeftOpen(false);
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Hash size={16} className="flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {ch.name}
                  </span>
                  {unreadCounts[ch.id] > 0 && activeChannel !== ch.id && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCounts[ch.id]}
                    </span>
                  )}
                </div>
                {currentUser?.role !== "editor" && activeChannel !== ch.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChannel(ch.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentUser?.role !== "editor" && (
            <div className="p-3 border-t border-gray-800">
              {showNewChannel ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateChannel();
                      if (e.key === "Escape") setShowNewChannel(false);
                    }}
                    placeholder="Kanalname..."
                    className="flex-1 px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateChannel}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewChannel(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Neuer Kanal
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Overlay for mobile sidebars */}
        {(leftOpen || rightOpen) && (
          <div
            className="absolute inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}

        {/* Center - Messages */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle size={48} className="mb-3 opacity-50" />
                <p className="text-sm">
                  Noch keine Nachrichten in #{activeChannelName}
                </p>
                <p className="text-xs mt-1">
                  Schreibe die erste Nachricht!
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const showDate = needsDateSeparator(msg, messages[i - 1]);
              const showAuthor =
                i === 0 ||
                messages[i - 1].userId !== msg.userId ||
                msg.timestamp - messages[i - 1].timestamp > 300000 ||
                showDate;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                        {formatDate(msg.timestamp)}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}

                  <div
                    className={`flex gap-3 px-2 py-0.5 hover:bg-gray-50 rounded-lg ${
                      showAuthor && i > 0 ? "mt-3" : ""
                    }`}
                  >
                    {showAuthor ? (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: msg.userColor }}
                      >
                        <span className="text-white text-sm font-semibold">
                          {getInitial(msg.userName)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-9 flex-shrink-0" />
                    )}

                    <div className="min-w-0 flex-1">
                      {showAuthor && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-gray-900">
                            {msg.userName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      {msg.text && (
                        <div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {msg.text}
                          </p>
                          {translations[msg.id] ? (
                            translations[msg.id] !== "—" ? (
                              <p className={`text-sm italic mt-0.5 whitespace-pre-wrap break-words ${
                                translations[msg.id].startsWith("⚠") ? "text-amber-500" : "text-blue-600"
                              }`}>
                                {translations[msg.id]}
                              </p>
                            ) : null
                          ) : (
                            <button
                              onClick={() => handleTranslate(msg.id, msg.text)}
                              disabled={translating === msg.id}
                              className="text-[11px] text-gray-400 hover:text-blue-500 mt-0.5 transition-colors flex items-center gap-1"
                            >
                              {translating === msg.id ? (
                                <><span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" /> {userLang === "de" ? "Übersetze..." : "Tłumaczę..."}</>
                              ) : (
                                userLang === "de" ? "Übersetzen" : "Tłumacz"
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {msg.file && (
                        <div className="mt-1">
                          {isImage(msg.fileType) ? (
                            <a
                              href={msg.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={msg.file}
                                alt={msg.fileName || "Bild"}
                                className="max-w-xs max-h-64 rounded-lg border border-gray-200 object-cover"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <FileText size={16} className="text-gray-500" />
                              <span className="text-sm text-gray-700 underline">
                                {msg.fileName || "Datei"}
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Datei anhängen"
              >
                {uploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Paperclip size={20} />
                )}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Nachricht an #${activeChannelName}...`}
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                onClick={() => handleSend()}
                disabled={sending || (!input.trim() && !uploading)}
                className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Members */}
        <aside
          className={`${
            rightOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0 absolute lg:relative right-0 z-20 w-60 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 h-full transition-transform duration-200`}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-400" />
              <span className="font-semibold text-sm text-gray-900">
                Mitglieder ({members.length})
              </span>
            </div>
            <button
              onClick={() => setRightOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: userColor(m.id) }}
                >
                  <span className="text-white text-xs font-semibold">
                    {getInitial(m.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1.5">
                    {m.name}
                    {m.role === "superadmin" && (
                      <Shield size={12} className="text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    @{m.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
