const API_GLOBAL_ENABLED = process.env.NEXT_PUBLIC_USE_API === "true";

const flagEnabled = (value: string | undefined, fallback: boolean) => {
  if (value == null) return fallback;
  return value === "true";
};

export const INSTITUTIONAL_API_ENABLED = flagEnabled(process.env.NEXT_PUBLIC_INSTITUTIONAL_API_ENABLED, API_GLOBAL_ENABLED);
export const SOCIAL_API_ENABLED = flagEnabled(process.env.NEXT_PUBLIC_SOCIAL_API_ENABLED, API_GLOBAL_ENABLED);
