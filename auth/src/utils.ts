import { ExtendedEnv } from "./types";

export function getEnv(key: keyof ExtendedEnv): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}