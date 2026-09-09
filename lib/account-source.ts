import type { AccountDataSource, BloxAccount } from "./types";

/**
 * Replace this implementation with your own authorized database/API.
 * Never send Roblox passwords, security cookies, or session tokens to this app.
 */
export class ApiAccountSource implements AccountDataSource {
  constructor(private readonly endpoint = "/api/accounts") {}

  async getAccounts(): Promise<BloxAccount[]> {
    const response = await fetch(this.endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error("Không thể tải dữ liệu tài khoản");
    const payload = await response.json();
    return payload.data;
  }
}
