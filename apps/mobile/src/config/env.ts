const required = (key: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

export const env = {
  supabaseUrl: required(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  apiUrl: required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL),
  revenueCatAndroidKey:
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "",
};
