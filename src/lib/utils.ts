import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strips all whitespace (leading, trailing, and internal) and uppercases a car plate, so
// what's sent to the backend already matches what it will normalize and store - this is just
// the immediate-feedback layer; the backend is the actual source of truth for this rule.
export function normalizeCarPlate(carPlate: string): string {
  return carPlate.replace(/\s+/g, "").toUpperCase()
}
