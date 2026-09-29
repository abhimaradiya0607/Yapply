import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import type { MeetingChatMessage } from "../../types/meeting-chat";

type MeetingChatProps = {
  messages: MeetingChatMessage[];
  currentUserId: string;
  connected: boolean;
  error: string | null;
  onSend: (message: string) => boolean;
  onClose: () => void;
  className?: string;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const MeetingChat = ({
  messages,
  currentUserId,
  connected,
  error,
  onSend,
  onClose,
  className,
}: MeetingChatProps) => {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const trimmed = draft.trim();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    if (onSend(trimmed)) setDraft("");
  };

  return (
    <aside
      className={
        className ??
        "fixed inset-x-0 top-0 bottom-24 z-30 flex min-h-0 flex-col border-base-content/10 bg-base-100 md:static md:inset-auto md:z-auto md:h-full md:w-[320px] md:shrink-0 md:border-l"
      }
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-base-content/10 px-4">
        <h2 className="text-sm font-semibold text-base-content">Chat</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-lg p-1.5 text-base-content/60 transition-colors hover:bg-base-content/10 hover:text-base-content"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-base-content/50">
            Messages in this room stay here while you're connected.
          </p>
        )}

        {messages.map((message) => {
          const mine = message.senderId === currentUserId;

          return (
            <div key={message.id} className={mine ? "flex flex-col items-end" : "flex flex-col items-start"}>
              {!mine && (
                <p className="mb-1 text-xs font-medium text-base-content/55">{message.senderName}</p>
              )}
              <p
                className={[
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-5",
                  mine
                    ? "rounded-br-md bg-primary text-primary-content"
                    : "rounded-bl-md bg-base-300 text-base-content",
                ].join(" ")}
              >
                {message.message}
              </p>
              <time className="mt-1 text-[11px] text-base-content/40" dateTime={message.createdAt}>
                {formatTime(message.createdAt)}
              </time>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="shrink-0 border-t border-base-content/10 p-3">
        {!connected && (
          <p className="mb-2 text-xs text-base-content/55">Connection lost</p>
        )}
        {error && <p className="mb-2 text-xs text-error">{error}</p>}
        <div className="flex items-center gap-2">
          <label htmlFor="meeting-chat-message" className="sr-only">
            Message
          </label>
          <input
            id="meeting-chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="h-11 min-w-0 flex-1 rounded-xl border border-base-content/10 bg-base-200 px-3 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={!trimmed || !connected}
            className="h-11 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-content disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </aside>
  );
};

export default MeetingChat;
