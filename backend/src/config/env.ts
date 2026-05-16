import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

// Validate required env vars
const required = ['SUPABASE_URL', 'SUPABASE_KEY'] as const;
for (const key of required) {
  if (!env[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
}
