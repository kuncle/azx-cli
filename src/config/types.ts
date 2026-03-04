export interface ProfileConfig {
  apiKey?: string;
  secretKey?: string;
  sandbox?: boolean;
  defaultOutput?: 'json' | 'table' | 'csv' | 'quiet';
}

export interface AzxConfig {
  defaultProfile: string;
  profiles: Record<string, ProfileConfig>;
}
