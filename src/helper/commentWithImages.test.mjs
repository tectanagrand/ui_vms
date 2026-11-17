import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedCommentImageFile,
  buildCommentImageUrl,
  parseCommentWithImages,
  formatCommentWithImages,
} from "./commentWithImages.js";

test("isAllowedCommentImageFile validates extensions and MIME types", () => {
  assert.equal(isAllowedCommentImageFile("photo.png"), true);
  assert.equal(isAllowedCommentImageFile("photo.PNG"), true);
  assert.equal(isAllowedCommentImageFile("photo.jpg"), true);
  assert.equal(isAllowedCommentImageFile("photo.jpeg"), true);
  assert.equal(isAllowedCommentImageFile("photo.webp"), true);
  assert.equal(isAllowedCommentImageFile("photo.gif"), true);
  assert.equal(isAllowedCommentImageFile("document.pdf"), false);
  assert.equal(isAllowedCommentImageFile("script.js"), false);
  assert.equal(isAllowedCommentImageFile("image/png"), true);
  assert.equal(isAllowedCommentImageFile("image/jpeg"), true);
  assert.equal(isAllowedCommentImageFile("image/webp"), true);
  assert.equal(isAllowedCommentImageFile("application/pdf"), false);
  assert.equal(isAllowedCommentImageFile(""), false);
  assert.equal(isAllowedCommentImageFile(null), false);
});

test("buildCommentImageUrl handles relative and absolute paths", () => {
  assert.equal(
    buildCommentImageUrl("attachments/comments/2026-11-17/test.png", "http://localhost:5000"),
    "http://localhost:5000/material/file/attachments/comments/2026-11-17/test.png"
  );
  assert.equal(
    buildCommentImageUrl("/material/file/attachments/comments/2026-11-17/test.png", "http://localhost:5000"),
    "http://localhost:5000/material/file/attachments/comments/2026-11-17/test.png"
  );
  assert.equal(
    buildCommentImageUrl("https://example.com/test.png", "http://localhost:5000"),
    "https://example.com/test.png"
  );
  assert.equal(
    buildCommentImageUrl("data:image/png;base64,abc"),
    "data:image/png;base64,abc"
  );
  assert.equal(buildCommentImageUrl(""), "");
});

test("parseCommentWithImages parses plain text without images", () => {
  const result = parseCommentWithImages("Mohon revisi spesifikasi");
  assert.equal(result.text, "Mohon revisi spesifikasi");
  assert.deepEqual(result.images, []);
});

test("parseCommentWithImages parses text with single and multiple images", () => {
  const input =
    "Tolong periksa dimensi berikut.\n\n![dimensi.png](attachments/comments/2026-11-17/dim.png)\n![label.jpg](attachments/comments/2026-11-17/lbl.jpg)";
  const result = parseCommentWithImages(input, { baseUrl: "http://api.test" });

  assert.equal(result.text, "Tolong periksa dimensi berikut.");
  assert.equal(result.images.length, 2);
  assert.equal(result.images[0].name, "dimensi.png");
  assert.equal(result.images[0].path, "attachments/comments/2026-11-17/dim.png");
  assert.equal(
    result.images[0].url,
    "http://api.test/material/file/attachments/comments/2026-11-17/dim.png"
  );
  assert.equal(result.images[1].name, "label.jpg");
  assert.equal(result.images[1].path, "attachments/comments/2026-11-17/lbl.jpg");
});

test("parseCommentWithImages handles empty and null inputs safely", () => {
  assert.deepEqual(parseCommentWithImages(""), { text: "", images: [] });
  assert.deepEqual(parseCommentWithImages(null), { text: "", images: [] });
  assert.deepEqual(parseCommentWithImages(undefined), { text: "", images: [] });
});

test("formatCommentWithImages produces correct markdown syntax", () => {
  assert.equal(formatCommentWithImages("Revisi ini", []), "Revisi ini");
  assert.equal(formatCommentWithImages("", []), "");

  const images = [
    { name: "sample.png", path: "attachments/comments/sample.png" },
    { fileName: "sample2.jpg", filePath: "attachments/comments/sample2.jpg" },
  ];

  const formatted = formatCommentWithImages("Revisi ini", images);
  assert.equal(
    formatted,
    "Revisi ini\n\n![sample.png](attachments/comments/sample.png)\n![sample2.jpg](attachments/comments/sample2.jpg)"
  );

  const onlyImages = formatCommentWithImages("", images);
  assert.equal(
    onlyImages,
    "![sample.png](attachments/comments/sample.png)\n![sample2.jpg](attachments/comments/sample2.jpg)"
  );
});
