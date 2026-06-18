const SUBSCRIPTIONS_KEY = "bog360-notification-subscribers";

export interface SubscriptionRecord {
  email: string;
  subscribedAt: string;
}

function readAll(): SubscriptionRecord[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SubscriptionRecord[];
  } catch {
    return [];
  }
}

function writeAll(records: SubscriptionRecord[]): void {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(records));
}

export function isSubscribed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return readAll().some((r) => r.email === normalized);
}

export function subscribe(email: string): { ok: true } | { ok: false; message: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, message: "Enter a valid work email address." };
  }
  if (isSubscribed(normalized)) {
    return { ok: false, message: "You are already subscribed." };
  }
  writeAll([{ email: normalized, subscribedAt: new Date().toISOString() }, ...readAll()]);
  return { ok: true };
}

export function getSubscriberCount(): number {
  return readAll().length;
}
