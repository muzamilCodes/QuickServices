import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * YYYY-MM-DD in the user's own timezone. `toISOString()` is UTC, which shows
 * yesterday's date before 05:30 IST and desyncs a date input from its label.
 */
export function toLocalDateInput(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}