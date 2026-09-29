import { ArrowRight } from "lucide-react";

type LiveRoomHeroProps = {
  isCreating: boolean;
  onCreate: () => void;
  onJoin: () => void;
};

const LiveRoomHero = ({ isCreating, onCreate, onJoin }: LiveRoomHeroProps) => (
  <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
    <div className="mx-auto max-w-[34rem] text-center lg:mx-0 lg:max-w-none lg:text-left">
      <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Realtime language practice
      </p>

      <h1 className="mt-4 text-[clamp(2.25rem,3.15vw,3.35rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-base-content">
        Practice languages.
        <span className="mt-1 block">
          Live, <span className="text-primary">together.</span>
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-[34rem] text-lg leading-relaxed text-base-content/65 lg:mx-0">
        Jump into a realtime language practice room, meet other learners, and build
        confidence through live conversation.
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
        <button
          type="button"
          onClick={onCreate}
          disabled={isCreating}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-content transition-colors duration-150 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        >
          {isCreating ? "Creating room..." : "Create a room"}
          {!isCreating && (
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onJoin}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-base-content/15 px-6 text-sm font-semibold text-base-content transition-colors duration-150 hover:bg-base-content/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Join with a code
        </button>
      </div>
    </div>

    <img
      src="/Designer-2.png"
      alt="Yapply collaboration and meeting interface"
      width={1536}
      height={1024}
      className="mx-auto h-auto w-full max-w-[40rem] lg:max-w-none"
    />
  </section>
);

export default LiveRoomHero;
