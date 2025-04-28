import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDisplayDateTime(
  isoString: string | null | undefined,
  locale = "en-US"
): string {
  if (!isoString) return "N/A";

  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC", // or omit if you want local-zone conversion
    }).format(date);
  } catch {
    return isoString;
  }
}
