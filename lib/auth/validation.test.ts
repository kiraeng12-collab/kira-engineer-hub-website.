import { describe, it, expect } from "vitest";
import { isValidPassword, isValidEmail, MIN_PASSWORD_LENGTH } from "./validation";

describe("isValidPassword", () => {
  it(`accepts passwords at least ${MIN_PASSWORD_LENGTH} characters long`, () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
  });

  it("rejects passwords shorter than the minimum", () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
  });

  it("rejects empty passwords", () => {
    expect(isValidPassword("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("person@example.com")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
  });
});
