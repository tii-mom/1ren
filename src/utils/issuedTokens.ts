import { UserIssuedToken } from "../types";

const KEY = "r1_user_issued_tokens";

export function loadIssuedTokens(): UserIssuedToken[] {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn("Error loading issued tokens:", e);
  }
  return [];
}

export function saveIssuedTokens(tokens: UserIssuedToken[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch (e) {
    console.warn("Error saving issued tokens:", e);
  }
}

export function updateIssuedToken(
  tokenId: string,
  updater: (token: UserIssuedToken) => UserIssuedToken
): UserIssuedToken[] {
  const tokens = loadIssuedTokens();
  const updated = tokens.map((t) => (t.id === tokenId ? updater(t) : t));
  saveIssuedTokens(updated);
  return updated;
}
