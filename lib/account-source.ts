import type { AccountDataSource, BloxAccount } from "./types";

/**
 * Replace this implementation with your own authorized database/API.
 * Never send Roblox passwords, security cookies, or session tokens to this app.
 */
export class ApiAccountSource implements AccountDataSource {
  constructor(private readonly endpoint = "/api/accounts") {}

  async getAccounts(): Promise<BloxAccount[]> {
    const response = await fetch(this.endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    }).catch(error => {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new Error("Supabase phản hồi quá lâu. Hãy kiểm tra URL và service role key.");
      }
      throw error;
    });
    const payload = await response.json().catch(() => null) as { data?: unknown; error?: string } | null;
    if (!response.ok) {
      throw new Error(payload?.error || `Không thể tải dữ liệu tài khoản (${response.status})`);
    }
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error("API trả về dữ liệu không hợp lệ");
    }
    return payload.data as BloxAccount[];
  }
}
