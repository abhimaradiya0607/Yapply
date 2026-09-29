type RoomMessageProps = {
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

const RoomMessage = ({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: RoomMessageProps) => (
  <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
    <div className="w-full max-w-md rounded-3xl border border-base-content/10 bg-base-200 px-6 py-8 text-center">
      <h1 className="text-xl font-semibold text-base-content">{title}</h1>
      <p className="mt-2 text-sm text-base-content/70">{description}</p>
      {(primaryLabel || secondaryLabel) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="rounded-xl border border-base-content/10 px-4 py-2.5 text-sm font-semibold text-base-content transition hover:bg-base-content/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && onPrimary && (
            <button
              type="button"
              onClick={onPrimary}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-content transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {primaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

export default RoomMessage;
