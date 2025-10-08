import { API_BASE_URL } from "./config";
import type { Trade } from "../types/trade";

export type CreateTradeRequest = Omit<Trade, "id">;

export async function createTrade(data: CreateTradeRequest): Promise<Trade> {
  const res = await fetch(`${API_BASE_URL}/api/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Failed to create trade (${res.status})`);
  }
  return res.json();
}

export async function listTrades(): Promise<Trade[]> {
  const res = await fetch(`${API_BASE_URL}/api/trades`);
  if (!res.ok) throw new Error(`Failed to load trades (${res.status})`);
  return res.json();
}

export async function deleteTrade(id: string): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/trades/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete trade (${res.status})`);
}
