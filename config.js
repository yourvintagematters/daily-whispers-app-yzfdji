// config.js

export const MODE = "production"; // we will switch this to "test" later

// LIVE SUPABASE VALUES
export const SUPABASE_URL = "https://cyktcpdmlsfjyrnutmln.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a3RjcGRtbHNmanlybnV0bWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzY4NTksImV4cCI6MjA5NDU1Mjg1OX0.iHgBFydklpqRZxRBy0yHlnw3CVTlh9Npaua1bzqQV-s";

// LIVE STRIPE VALUES
export const STRIPE_PUBLIC_KEY = "pk_live_51SN0VCD17kmTdMDJ7hWhbpcjEBmbQXG1qodb58IvAyqukZOWCHDl8Ht1eZ7CJPyq2jiTODJ7qSUWHQYvv8cA46zG00oP7nHikR";

// TEST SUPABASE VALUES
export const TEST_SUPABASE_URL = "https://pweskdufsgkzneibjnhe.supabase.co";
export const TEST_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZXNrZHVmc2drem5laWJqbmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNDc3OTcsImV4cCI6MjEwMjgyMzc5N30.jZ9XdMMe62HVBf3Y7AI3L4XWNgJiMWP8S-ERMnpECUk";

// TEST STRIPE VALUES
export const TEST_STRIPE_PUBLIC_KEY = "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX";

// Mode helper
export const IS_TEST_MODE = MODE === "test";
