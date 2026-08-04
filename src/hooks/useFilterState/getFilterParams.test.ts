import { getFilterParams, normalizeCountryFilter } from "./getFilterParams";

describe("normalizeCountryFilter", () => {
  it("returns empty string for en:world", () => {
    expect(normalizeCountryFilter("en:world")).toBe("");
  });

  it("keeps ISO country codes unchanged", () => {
    expect(normalizeCountryFilter("ca")).toBe("ca");
  });

  it("maps taxonomy country ids to ISO country codes", () => {
    expect(normalizeCountryFilter("en:canada")).toBe("ca");
    expect(normalizeCountryFilter("en:Canada")).toBe("ca");
  });
});

describe("getFilterParams", () => {
  it("normalizes the country query parameter", () => {
    const params = new URLSearchParams({
      country: "en:Canada",
      type: "category",
      value_tag: "en:crisps",
    });

    expect(getFilterParams(params)).toEqual({
      insightType: "category",
      valueTag: "en:crisps",
      country: "ca",
      brand: "",
      campaign: "",
      predictor: "",
      sorted: "true",
    });
  });
});
