const baseUrl = process.env.TRACKER_URL ?? "http://localhost:3000";
const apiKey = process.env.SCANNER_API_KEY ?? "dev-scanner-key";
const response = await fetch(`${baseUrl}/api/scans`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}`, "x-scanner-id": "mock-local" },
  body: JSON.stringify({ robloxUserId: "123456789", username: "AuthorizedDemo", timestamp: new Date().toISOString(), stats: { level: 2550, beli: 12500000, fragments: 8200, currentFruit: "Magnet", race: "Human", sea: 3, melee: "Godhuman", sword: "Cursed Dual Katana" }, items: [{ key: "magnet", quantity: 1, owned: true }, { key: "godhuman", quantity: 1, owned: true }] }),
});
console.log(response.status, await response.json());
