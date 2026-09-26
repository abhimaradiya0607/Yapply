const UNREACHABLE_AVATAR_HOSTS = [
  "avatar.iran.liara.run",
  "avatarapi.runflare.run",
];

export const usableProfileImage = (url?: string | null) => {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return undefined;
  }

  try {
    const host = new URL(trimmed).hostname;
    if (UNREACHABLE_AVATAR_HOSTS.includes(host)) return undefined;
  } catch {
    return undefined;
  }

  return trimmed;
};
