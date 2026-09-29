import { ArrowRight } from "lucide-react";

type LiveRoomCTAProps = {
  isCreating: boolean;
  onCreate: () => void;
};

const LiveRoomCTA = ({ isCreating, onCreate }: LiveRoomCTAProps) => (
  <section className="border-t border-base-content/10 pt-12">
    <h2 className="max-w-[14ch] text-3xl font-semibold tracking-[-0.03em] text-base-content sm:text-4xl">
      Ready for your next conversation?
    </h2>
    <p className="mt-4 max-w-md text-base leading-7 text-base-content/65">
      Create a room, invite a language partner, and start practicing.
    </p>
    <button
      type="button"
      onClick={onCreate}
      disabled={isCreating}
      className="group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-content transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
    >
      {isCreating ? "Creating room..." : "Create a room"}
      {!isCreating && (
        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      )}
    </button>
  </section>
);

export default LiveRoomCTA;
