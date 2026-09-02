import { describe, expect, it, vi } from "vitest";

import {
  capitaliseName,
  reformatValueTag,
  removeEmptyKeys,
  sleep,
} from "./utils";

describe("reformatValueTag", () => {
  it("returns falsy input unchanged", () => {
    expect(reformatValueTag(undefined)).toBeUndefined();
    expect(reformatValueTag("")).toBe("");
  });

  it("trims and lowercases", () => {
    expect(reformatValueTag("  Organic  ")).toBe("organic");
    expect(reformatValueTag("ORGANIC")).toBe("organic");
  });

  it("replaces spaces and apostrophes with dashes", () => {
    expect(reformatValueTag("agriculture biologique")).toBe(
      "agriculture-biologique",
    );
    expect(reformatValueTag("d'aquitaine")).toBe("d-aquitaine");
  });

  it("strips ampersands", () => {
    expect(reformatValueTag("m&m")).toBe("mm");
  });

  it("replaces accented characters with their unaccented form", () => {
    expect(reformatValueTag("café")).toBe("cafe");
    expect(reformatValueTag("crème brûlée")).toBe("creme-brulee");
    expect(reformatValueTag("äöüàâèêëîïôùû")).toBe("aouaaeeeiiouu");
  });

  it("collapses runs of dashes into one", () => {
    expect(reformatValueTag("a   b")).toBe("a-b");
    expect(reformatValueTag("a--b")).toBe("a-b");
    expect(reformatValueTag("a - b")).toBe("a-b");
  });

  it("leaves an already normalised tag untouched", () => {
    expect(reformatValueTag("en:organic")).toBe("en:organic");
  });
});

describe("removeEmptyKeys", () => {
  it("removes null, undefined and empty string values", () => {
    expect(
      removeEmptyKeys({ a: 1, b: null, c: undefined, d: "", e: "keep" }),
    ).toEqual({ a: 1, e: "keep" });
  });

  it("keeps falsy values that are not null or empty string", () => {
    expect(removeEmptyKeys({ zero: 0, no: false, nan: NaN })).toEqual({
      zero: 0,
      no: false,
      nan: NaN,
    });
  });

  it("mutates and returns the same object", () => {
    const input = { a: "", b: 1 };
    const result = removeEmptyKeys(input);

    expect(result).toBe(input);
    expect(input).toEqual({ b: 1 });
  });

  it("handles an empty object", () => {
    expect(removeEmptyKeys({})).toEqual({});
  });
});

describe("capitaliseName", () => {
  it("returns falsy input unchanged", () => {
    expect(capitaliseName(undefined)).toBeUndefined();
    expect(capitaliseName("")).toBe("");
  });

  it("drops the language prefix and capitalises the name", () => {
    expect(capitaliseName("en:france")).toBe("France");
    expect(capitaliseName("en:united-states")).toBe("United-states");
  });

  it("leaves an already capitalised name capitalised", () => {
    expect(capitaliseName("en:France")).toBe("France");
  });
});

describe("sleep", () => {
  it("resolves after the given delay", async () => {
    vi.useFakeTimers();
    try {
      const pending = sleep(1000);
      let resolved = false;
      void pending.then(() => (resolved = true));

      await vi.advanceTimersByTimeAsync(999);
      expect(resolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      await pending;
      expect(resolved).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
