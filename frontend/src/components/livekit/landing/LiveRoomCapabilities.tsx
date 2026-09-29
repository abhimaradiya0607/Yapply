const capabilities = [
  {
    label: "Video",
    description: "Realtime multi-participant calls",
  },
  {
    label: "Audio",
    description: "Clear voice conversations",
  },
  {
    label: "Chat",
    description: "Text beside the conversation",
  },
  {
    label: "Share",
    description: "Share your screen or room link",
  },
];

const LiveRoomCapabilities = () => (
  <section aria-label="Live Room capabilities">
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
      {capabilities.map((item, index) => (
        <li
          key={item.label}
          className={index === 0 ? "lg:pr-8" : "lg:border-l lg:border-base-content/10 lg:px-8"}
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-base-content/50">
            {item.label}
          </p>
          <p className="mt-2 max-w-[16rem] text-sm leading-6 text-base-content/70">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  </section>
);

export default LiveRoomCapabilities;
