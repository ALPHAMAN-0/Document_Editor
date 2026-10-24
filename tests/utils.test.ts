import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cn,
  countWords,
  formatDate,
  formatRelativeDate,
  getInitials,
} from "@/lib/utils";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("cn", () => {
  it("drops falsy values and lets the last conflicting class win", () => {
    assert.equal(cn("px-2", false, undefined, "px-4"), "px-4");
    assert.equal(cn("font-medium", ["text-sm"]), "font-medium text-sm");
  });
});

describe("getInitials", () => {
  it("returns a placeholder when there is no name", () => {
    assert.equal(getInitials(null), "?");
    assert.equal(getInitials(undefined), "?");
    assert.equal(getInitials(""), "?");
  });

  it("uses at most the first two initials, upper-cased", () => {
    assert.equal(getInitials("ada lovelace"), "AL");
    assert.equal(getInitials("Siam"), "S");
    assert.equal(getInitials("Grace Brewster Murray Hopper"), "GB");
  });
});

describe("countWords", () => {
  it("counts whitespace-separated words", () => {
    assert.equal(countWords("  hello   world \n again\t"), 3);
  });

  it("returns zero for empty or blank text", () => {
    assert.equal(countWords(""), 0);
    assert.equal(countWords("   \n  "), 0);
  });
});

describe("formatDate", () => {
  it("formats a date as short month, day and year", () => {
    assert.equal(formatDate(new Date(2024, 2, 15, 12)), "Mar 15, 2024");
  });
});

describe("formatRelativeDate", () => {
  const ago = (ms: number) => new Date(Date.now() - ms);

  it("describes recent times relative to now", () => {
    assert.equal(formatRelativeDate(ago(10_000)), "Just now");
    assert.equal(formatRelativeDate(ago(5 * MINUTE + 1000)), "5m ago");
    assert.equal(formatRelativeDate(ago(3 * HOUR + MINUTE)), "3h ago");
    assert.equal(formatRelativeDate(ago(2 * DAY + HOUR)), "2d ago");
  });

  it("falls back to the calendar date after a week", () => {
    const old = ago(30 * DAY);
    assert.equal(formatRelativeDate(old), formatDate(old));
  });

  it("accepts ISO strings as returned by the API", () => {
    assert.equal(formatRelativeDate(ago(2 * HOUR + MINUTE).toISOString()), "2h ago");
  });
});
