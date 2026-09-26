import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import PageLoader from "../components/PageLoader";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { usableProfileImage } from "../utils/profileImage";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading: isLoadingAuthUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken", callId],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    let cancelled = false;
    let videoClient: StreamVideoClient | null = null;
    let callInstance: Call | null = null;

    const initCall = async () => {
      setIsConnecting(true);

      try {
        const user = {
          id: authUser.id,
          name: authUser.fullname,
          image: usableProfileImage(authUser.profileurl),
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          token: tokenData.token,
          user,
        });

        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        if (cancelled) return;

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        if (cancelled) return;
        console.error("Error initializing call", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        if (!cancelled) setIsConnecting(false);
      }
    };

    void initCall();

    return () => {
      cancelled = true;
      setIsConnecting(true);
      const activeCall = callInstance;
      const activeClient = videoClient;
      setClient(null);
      setCall(null);

      void (async () => {
        if (activeCall) {
          await activeCall.leave().catch(() => undefined);
        }
        if (activeClient) {
          await activeClient.disconnectUser().catch(() => undefined);
        }
      })();
    };
  }, [tokenData, authUser, callId]);

  if (isLoadingAuthUser || isConnecting) return <PageLoader />;

  if (!client || !call) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-base-content">
        Unable to join this call.
      </div>
    );
  }

  return (
    <div className="h-dvh">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};


export default CallPage;
