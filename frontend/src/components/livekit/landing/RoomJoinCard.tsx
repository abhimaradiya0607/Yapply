import type { FormEvent } from "react";
import { ArrowRight, Plus } from "lucide-react";

export type RoomFormError = {
  title: string;
  description: string;
};

type RoomJoinCardProps = {
  roomInput: string;
  formError: RoomFormError | null;
  isJoining: boolean;
  isCreating: boolean;
  onRoomInputChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCreate: () => void;
};

const RoomJoinCard = ({
  roomInput,
  formError,
  isJoining,
  isCreating,
  onRoomInputChange,
  onSubmit,
  onCreate,
}: RoomJoinCardProps) => {
  const busy = isJoining || isCreating;

  return (
    <section id="join-room">
      <div className="mx-auto max-w-[720px] text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-base-content/45">
        Ready to practice?
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-base-content sm:text-4xl">
        Join a room in seconds.
      </h2>

      <form onSubmit={onSubmit} className="mt-8 text-left">
        <label htmlFor="live-room-code" className="sr-only">
          Room code or meeting link
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="live-room-code"
            value={roomInput}
            onChange={(event) => onRoomInputChange(event.target.value)}
            placeholder="Enter room code or paste meeting link"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 rounded-[14px] border border-base-content/10 bg-base-200 px-4 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[14px] bg-primary px-6 text-sm font-semibold text-primary-content transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          >
            {isJoining ? "Checking..." : "Join"}
            {!isJoining && <ArrowRight className="size-4" aria-hidden="true" />}
          </button>
        </div>

        {formError && (
          <div className="mt-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-left">
            <p className="text-sm font-semibold text-error">{formError.title}</p>
            <p className="mt-1 text-sm text-base-content/70">{formError.description}</p>
          </div>
        )}
      </form>

      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-base-content/40">or</p>
        <button
          type="button"
          disabled={busy}
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-base-content/15 px-5 text-sm font-semibold text-base-content transition-colors duration-150 hover:bg-base-content/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden="true" />
          {isCreating ? "Creating room..." : "Create a room"}
        </button>
      </div>
      </div>
    </section>
  );
};

export default RoomJoinCard;
