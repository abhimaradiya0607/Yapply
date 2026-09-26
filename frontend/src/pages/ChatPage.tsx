import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Video } from "lucide-react";
import toast from "react-hot-toast";
import { StreamChat, type Channel as StreamChannel } from "stream-chat";
import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  useChannelPreviewInfo,
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";

import ChatLoader from "../components/ChatLoader";
import Avatar from "../components/Avatar";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { usableProfileImage } from "../utils/profileImage";
import CallButton from '../components/CallButton'

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const buildChannelId = (userId: string, friendId: string) => {
  return [userId, friendId]
    .map((id) => id.replace(/-/g, ""))
    .sort()
    .join("")
    .slice(0, 64);
};

const ChatHeader = () => {
  const navigate = useNavigate();
  const { channel, members } = useChannelStateContext("ChatHeader");
  const { client } = useChatContext("ChatHeader");
  const { displayImage, displayTitle } = useChannelPreviewInfo({ channel });

  const otherUsers = Object.values(members ?? {})
    .map((member) => member.user)
    .filter((user) => Boolean(user?.id) && user?.id !== client.userID);

  const isDirect = otherUsers.length <= 1;
  const isOnline = otherUsers.some((user) => user?.online);
  const name = displayTitle || otherUsers[0]?.name || "Chat";

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-base-content/10 bg-base-100 px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Back"
          title="Back"
          onClick={() => navigate("/")}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-base-content transition-colors hover:bg-base-content/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <Avatar
          name={name}
          src={usableProfileImage(displayImage)}
          size="size-10"
          alt=""
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-base-content">{name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/55">
            {isDirect && isOnline ? (
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            ) : null}
            {isDirect ? (isOnline ? "Online" : "Offline") : `${otherUsers.length + 1} members`}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Start video call"
        title="Start video call"
        onClick={() => navigate("/call")}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content transition-colors hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:brightness-95"
      >
        <Video className="size-5" aria-hidden="true" />
      </button>
    </header>
  );
};

const ChatPage = () => {
  const { friendId: targetUserID } = useParams();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser?.id || !targetUserID) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser.id,
            name: authUser.fullname,
            image: usableProfileImage(authUser.profileurl),
          },
          tokenData.token,
        );

        const channelId = buildChannelId(authUser.id, targetUserID);
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser.id, targetUserID],
        });

        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);
      } catch (error) {
        console.log("error in initializing chat :", error);
        toast.error("Could not connect to chat. Please Try againn");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserID]);

  if (loading || !channel || !chatClient) return <ChatLoader />;

  return (
    <div className="chat-page">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <CallButton handleVedioCall={handleVedioCall}/>
          <Window>
            <ChatHeader />
            <MessageList />
            <MessageComposer focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
