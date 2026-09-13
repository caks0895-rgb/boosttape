import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSinceMs } from "./since.ts";

test("parseSinceMs accepts ISO, unix seconds, and unix ms", () => {
  assert.equal(parseSinceMs("2026-09-13T00:00:00.000Z"), Date.parse("2026-09-13T00:00:00.000Z"));
  assert.equal(parseSinceMs("1773360000"), 1773360000 * 1000);
  assert.equal(parseSinceMs("1773360000000"), 1773360000000);
  assert.equal(parseSinceMs("not-a-time"), null);
  assert.equal(parseSinceMs("  "), null);
  assert.equal(parseSinceMs("-1"), null);
});
