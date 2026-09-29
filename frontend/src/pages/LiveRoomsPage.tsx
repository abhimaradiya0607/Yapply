import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import LiveRoomCapabilities from "../components/livekit/landing/LiveRoomCapabilities";
import LiveRoomCTA from "../components/livekit/landing/LiveRoomCTA";
import LiveRoomFeatures from "../components/livekit/landing/LiveRoomFeatures";
import LiveRoomHero from "../components/livekit/landing/LiveRoomHero";
import LiveRoomHowItWorks from "../components/livekit/landing/LiveRoomHowItWorks";
import RoomJoinCard, {
  type RoomFormError,
} from "../components/livekit/landing/RoomJoinCard";
import { createLiveRoom, getLiveRoom } from "../lib/api";
import { normalizeRoomCode } from "../utils/roomCode";

const LiveRoomsPage = () => {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");
  const [formError, setFormError] = useState<RoomFormError | null>(null);

  const createRoom = useMutation({
    mutationFn: createLiveRoom,
    onSuccess: (room) => {
      navigate(`/live-room/${room.roomCode}/preview`);
    },
    onError: (error) => {
      const offline = axios.isAxiosError(error) && !error.response;
      toast.error(
        offline
          ? "Yapply is unavailable right now. Try again in a moment."
          : "Couldn't create a room.",
      );
    },
  });

  const joinRoom = useMutation({
    mutationFn: getLiveRoom,
  });

  const continueToRoom = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const roomCode = normalizeRoomCode(roomInput);

    if (!roomCode) {
      setFormError({
        title: "Invalid room code",
        description: "Enter a code like YAP-7K4P2Q or paste a meeting link.",
      });
      return;
    }

    try {
      const room = await joinRoom.mutateAsync(roomCode);

      if (room.status !== "active") {
        setFormError({
          title: "Room ended",
          description: "This room is no longer available.",
        });
        return;
      }

      navigate(`/live-room/${room.roomCode}/preview`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setFormError({
          title: "Room not found",
          description: "Check the room code and try again.",
        });
        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setFormError({
          title: "Please sign in again",
          description: "Your session expired before the room could be opened.",
        });
        return;
      }

      if (axios.isAxiosError(error) && !error.response) {
        setFormError({
          title: "Can't reach Yapply",
          description: "The server is unavailable. Try again in a moment.",
        });
        return;
      }

      setFormError({
        title: "Couldn't open that room",
        description: "Try again in a moment.",
      });
    }
  };

  const focusJoin = () => {
    document.getElementById("join-room")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("live-room-code")?.focus();
  };

  return (
    <main className="min-h-full bg-base-100 px-4 pb-16 pt-10 text-base-content sm:px-6 lg:px-8 lg:pt-14">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col">
        <LiveRoomHero
          isCreating={createRoom.isPending}
          onCreate={() => createRoom.mutate()}
          onJoin={focusJoin}
        />
        <div className="mt-16 lg:mt-20">
          <RoomJoinCard
            roomInput={roomInput}
            formError={formError}
            isJoining={joinRoom.isPending}
            isCreating={createRoom.isPending}
            onRoomInputChange={(value) => {
              setRoomInput(value);
              if (formError) setFormError(null);
            }}
            onSubmit={(event) => void continueToRoom(event)}
            onCreate={() => createRoom.mutate()}
          />
        </div>
        <div className="mt-20 lg:mt-24">
          <LiveRoomCapabilities />
        </div>
        <div className="mt-20 lg:mt-24">
          <LiveRoomFeatures />
        </div>
        <div className="mt-20 lg:mt-24">
          <LiveRoomHowItWorks />
        </div>
        <div className="mt-20 lg:mt-24">
          <LiveRoomCTA
            isCreating={createRoom.isPending}
            onCreate={() => createRoom.mutate()}
          />
        </div>
      </div>
    </main>
  );
};

export default LiveRoomsPage;
