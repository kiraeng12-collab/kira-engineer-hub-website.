import { describe, it, expect } from "vitest";
import { createReference, isEmail, safeText } from "./api-utils";

describe("createReference", () => {
  it("matches the KE-PREFIX-YYYY-XXXXXX format", () => {
    const reference = createReference("CON");
    expect(reference).toMatch(/^KE-CON-\d{4}-[0-9A-Z]{6}$/);
  });

  it("includes the current year", () => {
    const reference = createReference("EB");
    expect(reference).toContain(`-${new Date().getFullYear()}-`);
  });

  it("generates different references on repeated calls", () => {
    const a = createReference("SEC");
    const b = createReference("SEC");
    expect(a).not.toBe(b);
  });
});

describe("isEmail", () => {
  it("accepts valid emails", () => {
    expect(isEmail("person@example.com")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("")).toBe(false);
  });
});

describe("safeText", () => {
  it("collapses whitespace and trims", () => {
    expect(safeText("  hello   world  ")).toBe("hello world");
  });

  it("truncates to maxLength", () => {
    expect(safeText("abcdef", 3)).toBe("abc");
  });
});
