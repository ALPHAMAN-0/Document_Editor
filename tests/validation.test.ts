import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  isPlainObject,
  parsePositiveInt,
  validateDocumentFields,
} from "@/lib/validation";

describe("parsePositiveInt", () => {
  it("returns the parsed value for a valid positive integer", () => {
    assert.equal(parsePositiveInt("7", 1, 100), 7);
  });

  it("falls back when the parameter is missing or not a number", () => {
    assert.equal(parsePositiveInt(null, 1, 100), 1);
    assert.equal(parsePositiveInt(undefined, 20, 100), 20);
    assert.equal(parsePositiveInt("", 20, 100), 20);
    assert.equal(parsePositiveInt("abc", 20, 100), 20);
    assert.equal(parsePositiveInt("NaN", 20, 100), 20);
  });

  it("falls back for zero and negative values", () => {
    assert.equal(parsePositiveInt("0", 20, 100), 20);
    assert.equal(parsePositiveInt("-5", 1, 100), 1);
  });

  it("clamps values above the maximum", () => {
    assert.equal(parsePositiveInt("1000", 20, 100), 100);
    assert.equal(parsePositiveInt("99999999999999999999999", 1, 1_000_000), 1_000_000);
    assert.equal(parsePositiveInt("Infinity", 1, 100), 1);
  });
});

describe("isPlainObject", () => {
  it("accepts JSON objects only", () => {
    assert.equal(isPlainObject({}), true);
    assert.equal(isPlainObject({ title: "x" }), true);
    assert.equal(isPlainObject(null), false);
    assert.equal(isPlainObject([1, 2]), false);
    assert.equal(isPlainObject("title"), false);
    assert.equal(isPlainObject(42), false);
    assert.equal(isPlainObject(undefined), false);
  });
});

describe("validateDocumentFields", () => {
  it("accepts a title at the length limit", () => {
    assert.equal(validateDocumentFields({ title: "a".repeat(MAX_TITLE_LENGTH) }), null);
  });

  it("rejects a title over the length limit", () => {
    const result = validateDocumentFields({ title: "a".repeat(MAX_TITLE_LENGTH + 1) });
    assert.equal(result?.status, 400);
  });

  it("rejects oversized content in either content field", () => {
    const huge = "x".repeat(MAX_CONTENT_LENGTH + 1);
    assert.equal(validateDocumentFields({ content: huge })?.status, 413);
    assert.equal(validateDocumentFields({ contentHtml: huge })?.status, 413);
  });

  it("accepts ordinary content and ignores absent fields", () => {
    assert.equal(validateDocumentFields({}), null);
    assert.equal(
      validateDocumentFields({ title: "Notes", contentHtml: "<p>Hello</p>" }),
      null
    );
  });
});
