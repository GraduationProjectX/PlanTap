import assert from "node:assert/strict";
import test from "node:test";

import {
  isLegacyCatalogEventInvalid,
  isPlaceSourceRecord,
  isHotelLikeText,
} from "./eventCatalog.ts";

test("isPlaceSourceRecord flags generic place ingestors", () => {
  assert.equal(isPlaceSourceRecord("googleplaces"), true);
  assert.equal(isPlaceSourceRecord("foursquare"), true);
  assert.equal(isPlaceSourceRecord("visitsaudi"), false);
  assert.equal(isPlaceSourceRecord(null), false);
});

test("isHotelLikeText detects obvious hotel content", () => {
  assert.equal(isHotelLikeText("Luxury Hotel & Resort"), true);
  assert.equal(isHotelLikeText("Boutique Suites by the sea"), true);
  assert.equal(isHotelLikeText("Dinner and winning trivia"), false);
  assert.equal(isHotelLikeText("Live Concert Night"), false);
});

test("isLegacyCatalogEventInvalid removes place-source records", () => {
  assert.equal(
    isLegacyCatalogEventInvalid({
      externalSource: "googleplaces",
      title: "Waterfront destination",
      categories: ["Places"],
      tags: ["tourist_attraction"],
      startAt: null,
      endAt: null,
    }),
    true,
  );
});

test("isLegacyCatalogEventInvalid removes hotel-like records", () => {
  assert.equal(
    isLegacyCatalogEventInvalid({
      externalSource: "manual",
      title: "Al Khobar Hotel",
      categories: ["entertainment"],
      tags: [],
      startAt: 1,
      endAt: 2,
    }),
    true,
  );
});

test("isLegacyCatalogEventInvalid removes undated Visit Saudi rows", () => {
  assert.equal(
    isLegacyCatalogEventInvalid({
      externalSource: "visitsaudi",
      title: "Jeddah Season Experience",
      categories: ["entertainment"],
      tags: ["Attractions"],
      startAt: 1,
      endAt: null,
    }),
    true,
  );
});

test("isLegacyCatalogEventInvalid keeps scheduled non-hotel events", () => {
  assert.equal(
    isLegacyCatalogEventInvalid({
      externalSource: "manual",
      title: "Music Festival",
      categories: ["concerts"],
      tags: ["festival"],
      startAt: 1,
      endAt: 2,
    }),
    false,
  );
});
