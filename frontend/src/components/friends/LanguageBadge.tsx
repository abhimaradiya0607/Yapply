import LanguageFlag from "./LanguageFlag";

const formatLanguage = (language: string) =>
  language
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const LanguageBadge = ({
  kind,
  language,
}: {
  kind: "native" | "learning";
  language?: string | null;
}) => {
  const value = language?.trim();
  if (!value) return null;

  const label = kind === "native" ? "Native" : "Learning";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-xl bg-[#222328] px-2.5 py-1.5 ${
        kind === "learning"
          ? "border border-[#c7ff20]/20"
          : "border border-white/[0.08]"
      }`}
    >
      <LanguageFlag language={value} />
      <span className="truncate text-sm">
        <span className="text-xs font-medium text-[#9a9ca6]">{label} · </span>
        <span className="font-medium text-[#f5f5f5]">{formatLanguage(value)}</span>
      </span>
    </span>
  );
};

export default LanguageBadge;
