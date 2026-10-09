import { describe, it, expect } from "vitest";
import {
  assertTestDatabase,
  endpointIdFromUrl,
  PROD_DB_ENDPOINT,
  TEST_DB_ENDPOINT,
} from "./db-guard";

const testUrl = (host: string) =>
  `postgresql://user:pw@${host}.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require`;

describe("endpointIdFromUrl", () => {
  it("extracts the endpoint id from a direct host", () => {
    expect(endpointIdFromUrl(testUrl(TEST_DB_ENDPOINT))).toBe(TEST_DB_ENDPOINT);
  });

  it("strips the -pooler suffix from a pooled host", () => {
    expect(endpointIdFromUrl(testUrl(`${TEST_DB_ENDPOINT}-pooler`))).toBe(TEST_DB_ENDPOINT);
  });
});

describe("assertTestDatabase", () => {
  it("passes for the test branch endpoint (direct and pooled)", () => {
    expect(() => assertTestDatabase(testUrl(TEST_DB_ENDPOINT))).not.toThrow();
    expect(() => assertTestDatabase(testUrl(`${TEST_DB_ENDPOINT}-pooler`))).not.toThrow();
  });

  it("throws for the production branch endpoint", () => {
    expect(() => assertTestDatabase(testUrl(PROD_DB_ENDPOINT))).toThrow(/production/i);
  });

  it("throws for any other, unexpected endpoint", () => {
    expect(() => assertTestDatabase(testUrl("ep-some-other-branch-xyz"))).toThrow(
      /test branch/i,
    );
  });

  it("throws when DATABASE_URL is missing", () => {
    expect(() => assertTestDatabase(undefined)).toThrow(/not set/i);
    expect(() => assertTestDatabase("")).toThrow(/not set/i);
  });

  it("throws when DATABASE_URL is not a valid URL", () => {
    expect(() => assertTestDatabase("not-a-url")).toThrow(/valid URL/i);
  });
});
