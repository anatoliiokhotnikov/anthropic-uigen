// @vitest-environment node
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { createSession, getSession, deleteSession, verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

const TEST_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: object, expiresIn = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(TEST_SECRET);
}

type MockCookieStore = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

let mockCookieStore: MockCookieStore;

beforeEach(() => {
  mockCookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
  (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
});

afterEach(() => {
  vi.clearAllMocks();
});

// createSession

test("createSession sets the auth-token cookie with correct options", async () => {
  await createSession("user-1", "user@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledWith(
    "auth-token",
    expect.any(String),
    expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
  );
});

test("createSession stores a JWT containing userId and email", async () => {
  await createSession("user-1", "user@example.com");

  const [, token] = mockCookieStore.set.mock.calls[0];
  const { payload } = await jwtVerify(token, TEST_SECRET);

  expect(payload.userId).toBe("user-1");
  expect(payload.email).toBe("user@example.com");
});

test("createSession sets secure: false outside production", async () => {
  await createSession("user-1", "user@example.com");

  const [, , options] = mockCookieStore.set.mock.calls[0];
  expect(options.secure).toBe(false);
});

test("createSession sets expires ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "user@example.com");
  const after = Date.now();

  const [, , options] = mockCookieStore.set.mock.calls[0];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(options.expires).toBeInstanceOf(Date);
  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

// getSession

test("getSession returns null when no cookie exists", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  expect(await getSession()).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const token = await makeToken({ userId: "user-1", email: "user@example.com" });
  mockCookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("user@example.com");
});

test("getSession returns null for an invalid token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not-a-valid-jwt" });

  expect(await getSession()).toBeNull();
});

test("getSession returns null for an expired token", async () => {
  const token = await makeToken({ userId: "user-1", email: "user@example.com" }, "-1s");
  mockCookieStore.get.mockReturnValue({ value: token });

  expect(await getSession()).toBeNull();
});

// deleteSession

test("deleteSession removes the auth-token cookie", async () => {
  await deleteSession();

  expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
});

// verifySession

test("verifySession returns null when request has no auth-token cookie", async () => {
  const request = new NextRequest("http://localhost/api/test");

  expect(await verifySession(request)).toBeNull();
});

test("verifySession returns the session payload for a valid token", async () => {
  const token = await makeToken({ userId: "user-1", email: "user@example.com" });
  const request = new NextRequest("http://localhost/api/test", {
    headers: { cookie: `auth-token=${token}` },
  });

  const session = await verifySession(request);

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("user@example.com");
});

test("verifySession returns null for an invalid token", async () => {
  const request = new NextRequest("http://localhost/api/test", {
    headers: { cookie: "auth-token=not-a-valid-jwt" },
  });

  expect(await verifySession(request)).toBeNull();
});

test("verifySession returns null for an expired token", async () => {
  const token = await makeToken({ userId: "user-1", email: "user@example.com" }, "-1s");
  const request = new NextRequest("http://localhost/api/test", {
    headers: { cookie: `auth-token=${token}` },
  });

  expect(await verifySession(request)).toBeNull();
});
