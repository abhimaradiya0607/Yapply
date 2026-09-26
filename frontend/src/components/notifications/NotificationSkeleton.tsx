const NotificationSkeleton = () => {
  return (
    <div
      className="flex animate-pulse flex-col gap-4 rounded-[24px] border border-base-content/10 bg-base-200 p-5 sm:flex-row sm:items-center"
      aria-hidden="true"
    >
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="size-12 shrink-0 rounded-full bg-base-300" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-40 rounded-md bg-base-300" />
          <div className="h-3 w-24 rounded-md bg-base-300" />
          <div className="flex gap-2 pt-1">
            <div className="h-8 w-36 rounded-xl bg-base-300" />
            <div className="h-8 w-40 rounded-xl bg-base-300" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-24 rounded-xl bg-base-300" />
        <div className="h-10 w-24 rounded-xl bg-base-300" />
      </div>
    </div>
  );
};

export default NotificationSkeleton;
