import { LANGUAGE_TO_FLAG } from "../constants";

const EXTRA_LANGUAGE_COUNTRY_CODES = {
  gujarati: "in",
  punjabi: "in",
  marathi: "in",
  sindhi: "in",
  bengali: "in",
  tamil: "in",
  telugu: "in",
  kannada: "in",
  malayalam: "in",
  chinese: "cn",
} as const;

const LANGUAGE_COUNTRY_CODES: Record<string, string> = {
  ...LANGUAGE_TO_FLAG,
  ...EXTRA_LANGUAGE_COUNTRY_CODES,
};

const getLanguageCountryCode = (
  language?: string | null,
): string | undefined => {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return undefined;

  const code = LANGUAGE_COUNTRY_CODES[normalized];
  return code || undefined;
};

export const getLanguageFlagUrl = (
  language?: string | null,
): string | undefined => {
  const code = getLanguageCountryCode(language);
  if (!code) return undefined;

  return `https://flagcdn.com/w40/${code}.png`;
};
