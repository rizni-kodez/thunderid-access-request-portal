function readRequiredEnv(key: string): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[key]?.trim();

  if (!value) {
    const message = `Missing required environment variable: ${key}. Add it to ui-web/.env.`;
    console.error(message);
    throw new Error(message);
  }

  return value;
}

export const appConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    "http://localhost:4000",
  thunderIdBaseUrl: readRequiredEnv("VITE_THUNDERID_BASE_URL"),
  thunderIdClientId: readRequiredEnv("VITE_THUNDERID_CLIENT_ID")
};
