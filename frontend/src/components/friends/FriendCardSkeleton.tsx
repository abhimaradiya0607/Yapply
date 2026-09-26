const FriendCardSkeleton = () => {
  return (
    <div
      className="flex h-full animate-pulse flex-col rounded-[28px] border border-base-content/10 bg-base-200 p-5"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="size-14 shrink-0 rounded-full bg-base-300" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-2/3 rounded-md bg-base-300" />
          <div className="h-3.5 w-1/3 rounded-md bg-base-300" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <div className="h-8 w-36 rounded-xl bg-base-300" />
        <div className="h-8 w-40 rounded-xl bg-base-300" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-md bg-base-300" />
        <div className="h-3 w-4/5 rounded-md bg-base-300" />
      </div>

      <div className="mt-auto pt-5">
        <div className="h-11 w-full rounded-xl bg-base-300" />
      </div>
    </div>
  );
};

export default FriendCardSkeleton;
