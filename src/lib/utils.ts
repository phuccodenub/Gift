import { type ClassValue, clsx } from "clsx";
import { getClientBaseUrl, getServerBaseUrl } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return getClientBaseUrl();
  return getServerBaseUrl();
}

export function getShareUrl(giftSlugOrId: string, options?: { server?: boolean }) {
  const baseUrl = options?.server ? getServerBaseUrl() : getBaseUrl();
  return `${baseUrl}/gift/${giftSlugOrId}`;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function animationDuration(speed: "slow" | "normal" | "fast") {
  switch (speed) {
    case "slow":
      return 1.5;
    case "fast":
      return 0.5;
    default:
      return 0.8;
  }
}
