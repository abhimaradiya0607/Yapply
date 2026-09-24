const getInitials = (fullname?: string | null) => {
  const parts = fullname?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const Avatar = ({
  name,
  src,
  size = "size-12",
  alt,
}: {
  name?: string | null;
  src?: string | null;
  size?: string;
  alt?: string;
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#2a2b31] text-sm font-semibold text-[#f5f5f5]`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
};

export default Avatar;
