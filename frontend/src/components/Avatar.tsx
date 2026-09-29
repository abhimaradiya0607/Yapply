import { usableProfileImage } from "../utils/profileImage";

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
  textSize = "text-sm",
  alt,
}: {
  name?: string | null;
  src?: string | null;
  size?: string;
  textSize?: string;
  alt?: string;
}) => {
  const image = usableProfileImage(src);

  if (image) {
    return (
      <img
        src={image}
        alt={alt ?? ""}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${size} ${textSize} flex shrink-0 items-center justify-center rounded-full bg-base-300 font-semibold text-base-content`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
};

export default Avatar;
