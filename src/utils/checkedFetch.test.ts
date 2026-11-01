import { afterEach, expect, test, vi } from "vitest";
import { checkedFetch, checkedJsonFetch } from "./checkedFetch";

afterEach(() => vi.restoreAllMocks());

test("passes native options and returns the response", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(globalThis.Response.json({ saved: true }));
  const init: RequestInit = {
    method: "PATCH",
    credentials: "include",
    body: "{}",
  };
  const response = await checkedFetch("https://example.com", init);
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ saved: true });
  expect(fetchMock).toHaveBeenCalledWith("https://example.com", init);
});

test("rejects unsuccessful HTTP responses", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new globalThis.Response(null, { status: 404 }),
  );
  await expect(checkedFetch("https://example.com")).rejects.toThrow(
    "status 404",
  );
});

test("propagates request failures", async () => {
  const error = new Error("Network failed");
  vi.spyOn(globalThis, "fetch").mockRejectedValue(error);
  await expect(checkedFetch("https://example.com")).rejects.toBe(error);
});

test("parses JSON and forwards request options", async () => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(globalThis.Response.json({ name: "Example" }));
  const init = { signal: globalThis.AbortSignal.timeout(1000) };
  await expect(checkedJsonFetch("https://example.com", init)).resolves.toEqual({
    name: "Example",
  });
  expect(fetchMock).toHaveBeenCalledWith("https://example.com", init);
});

test("rejects invalid JSON and HTTP errors", async () => {
  vi.spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new globalThis.Response("not json"))
    .mockResolvedValueOnce(new globalThis.Response(null, { status: 500 }));
  await expect(checkedJsonFetch("https://example.com")).rejects.toThrow(
    SyntaxError,
  );
  await expect(checkedJsonFetch("https://example.com")).rejects.toThrow(
    "status 500",
  );
});
