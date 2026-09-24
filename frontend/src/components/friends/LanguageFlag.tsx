import { getLanguageFlagUrl } from "../../utils/languageFlags";

const LanguageFlag = ({ language }: { language?: string | null }) => {
  const value = language?.trim();
  const src = value ? getLanguageFlagUrl(value) : undefined;

  if (!value || !src) return null;

  return (
    <img
      src={src}
      alt={`${value} flag`}
      width={24}
      height={16}
      loading="lazy"
      decoding="async"
      className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
    />
  );
};

export default LanguageFlag;
