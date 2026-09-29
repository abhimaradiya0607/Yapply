import { MessageSquare, MonitorUp, Users } from "lucide-react";

const features = [
  {
    icon: Users,
    eyebrow: "Together",
    title: "Practice together",
    description: "Meet language partners and build confidence through real conversation.",
  },
  {
    icon: MessageSquare,
    eyebrow: "Conversation",
    title: "Talk and chat",
    description: "Keep text chat alongside your live conversation.",
  },
  {
    icon: MonitorUp,
    eyebrow: "Context",
    title: "Share and explain",
    description: "Share your screen or a room link when a conversation needs more context.",
  },
];

const LiveRoomFeatures = () => (
  <section>
    <div className="max-w-[640px]">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-base-content sm:text-4xl">
        Everything you need to practice live
      </h2>
      <p className="mt-4 text-base leading-7 text-base-content/65">
        From your first hello to a full conversation, Live Rooms keeps the tools for
        speaking together in one place.
      </p>
    </div>

    <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <article key={feature.title} className="border-t border-base-content/10 pt-6">
            <Icon className="size-4 text-base-content/55" aria-hidden="true" />
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
              {feature.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-base-content">
              {feature.title}
            </h3>
            <p className="mt-2 max-w-[28ch] text-sm leading-6 text-base-content/65">
              {feature.description}
            </p>
          </article>
        );
      })}
    </div>
  </section>
);

export default LiveRoomFeatures;
