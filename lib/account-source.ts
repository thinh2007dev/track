import type { AccountDataSource, BloxAccount } from "./types";

/**
 * Replace this implementation with your own authorized database/API.
 * Never send Roblox passwords, security cookies, or session tokens to this app.
 */
export class ApiAccountSource implements AccountDataSource {
  constructor(private readonly endpoint = "/api/accounts") {}

  async getAccounts(): Promise<BloxAccount[]> {
    const response = await fetch(this.endpoint, { cache: "no-store" });
    const payload = await response.json().catch(() => null) as { data?: unknown; error?: string; detail?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.detail || payload?.error || `Không thể tải dữ liệu tài khoản (${response.status})`);
    }
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error("API trả về dữ liệu không hợp lệ");
    }
    return payload.data as BloxAccount[];
  }
}
