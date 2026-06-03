import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGooglePlaceDescription,
  collectGooglePhotoReferences,
  getGooglePlaceDescriptor,
  getGooglePlaceCategories,
  isGoogleFoodPlace,
} from "./googlePlaces.ts";

test("buildGooglePlaceDescription prefers editorial summary when available", () => {
  const description = buildGooglePlaceDescription({
    title: "Half Moon Bay",
    city: "Khobar",
    address: "Corniche Rd, Al Khobar 34611",
    rating: 4.6,
    types: ["tourist_attraction", "point_of_interest"],
    editorialSummary: "  Scenic waterfront destination with cafes and walking paths.  ",
  });

  assert.equal(description, "Scenic waterfront destination with cafes and walking paths.");
});

test("buildGooglePlaceDescription falls back to metadata when Google has no summary", () => {
  const description = buildGooglePlaceDescription({
    title: "Ajdan Walk",
    city: "Khobar",
    address: "Prince Turki St, Al Khobar",
    rating: 4.4,
    types: ["shopping_mall", "point_of_interest"],
    editorialSummary: null,
  });

  assert.equal(
    description,
    "Ajdan Walk is a shopping mall in Khobar. It is rated 4.4/5 on Google. Located at Prince Turki St, Al Khobar.",
  );
});

test("getGooglePlaceDescriptor skips generic Google place types", () => {
  assert.equal(
    getGooglePlaceDescriptor(["point_of_interest", "tourist_attraction"]),
    "tourist attraction",
  );
  assert.equal(getGooglePlaceDescriptor(["establishment", "food"]), null);
});

test("collectGooglePhotoReferences keeps order, uniqueness, and limit", () => {
  const references = collectGooglePhotoReferences(
    [
      { photo_reference: "photo-1" },
      { photo_reference: "photo-1" },
      { photo_reference: "photo-2" },
      { photo_reference: "photo-3" },
    ],
    2,
  );

  assert.deepEqual(references, ["photo-1", "photo-2"]);
});

test("getGooglePlaceCategories maps shopping-like places to entertainment", () => {
  const categories = getGooglePlaceCategories({
    title: "Ajdan Walk",
    types: ["shopping_mall", "point_of_interest"],
  });

  assert.deepEqual(categories, ["entertainment"]);
});

test("getGooglePlaceCategories maps cultural places to arts", () => {
  const categories = getGooglePlaceCategories({
    title: "Heritage Museum",
    types: ["museum", "tourist_attraction"],
  });

  assert.deepEqual(categories, ["arts", "adventure"]);
});

test("isGoogleFoodPlace detects food-like Google places", () => {
  assert.equal(
    isGoogleFoodPlace({
      title: "Tea House",
      types: ["tea_house", "point_of_interest"],
    }),
    true,
  );
  assert.equal(
    isGoogleFoodPlace({
      title: "Corniche Park",
      types: ["park", "tourist_attraction"],
    }),
    false,
  );
});

test("isGoogleFoodPlace catches lounge and arabic cafe titles during the temporary hold", () => {
  assert.equal(
    isGoogleFoodPlace({
      title: "مقهى هوكا فيلفيت",
      types: ["hookah_bar", "point_of_interest"],
    }),
    true,
  );
});
