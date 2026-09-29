const steps = [
  {
    number: "01",
    title: "Create or join",
    description: "Create a room or enter a code shared by another learner.",
  },
  {
    number: "02",
    title: "Check your setup",
    description: "Preview your camera and microphone before you join.",
  },
  {
    number: "03",
    title: "Start talking",
    description: "Practice together in realtime.",
  },
];

const LiveRoomHowItWorks = () => (
  <section>
    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-base-content sm:text-4xl">
      How it works
    </h2>

    <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
      <div
        className="absolute left-[16%] right-[16%] top-[15px] hidden h-px bg-base-content/10 md:block"
        aria-hidden="true"
      />
      {steps.map((step) => (
        <li key={step.number} className="relative">
          <div className="flex items-center gap-3 md:block">
            <span className="relative z-10 flex size-8 items-center justify-center rounded-full border border-base-content/15 bg-base-100 text-[11px] font-semibold tracking-[0.08em] text-primary">
              {step.number}
            </span>
            <h3 className="text-base font-semibold text-base-content md:mt-5">{step.title}</h3>
          </div>
          <p className="mt-2 max-w-[28ch] text-sm leading-6 text-base-content/65 md:mt-2">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  </section>
);

export default LiveRoomHowItWorks;
