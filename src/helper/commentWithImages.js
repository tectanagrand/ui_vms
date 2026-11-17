// Parses and formats comment/remark text containing attached images.
// Format: markdown image syntax ![filename.png](attachments/comments/.../...)
// Deliberately import-free for node --test runners.

export const COMMENT_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];

export const COMMENT_IMAGE_MARKDOWN_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g;

/**
 * Check if a filename or MIME type represents an allowed comment image.
 *
 * @param {string} filenameOrType
 * @returns {boolean}
 */
export function isAllowedCommentImageFile(filenameOrType) {
  if (!filenameOrType || typeof filenameOrType !== "string") {
    return false;
  }
  const str = filenameOrType.toLowerCase().trim();
  if (str.startsWith("image/")) {
    const sub = str.split("/")[1] || "";
    return COMMENT_IMAGE_EXTENSIONS.includes(sub);
  }
  const ext = str.includes(".") ? str.split(".").pop().toLowerCase() : str;
  return COMMENT_IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Resolve display URL of a stored comment image path.
 *
 * @param {string} filePath
 * @param {string} [baseUrl] - optional host/API base URL
 * @returns {string}
 */
export function buildCommentImageUrl(filePath, baseUrl) {
  if (!filePath || typeof filePath !== "string") {
    return "";
  }
  const cleanPath = filePath.trim();
  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:") ||
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  const prefix = cleanPath.startsWith("/material/file/")
    ? cleanPath
    : `/material/file/${cleanPath.replace(/^\/+/, "")}`;

  // If running in Vite / browser, resolve VITE_URL_LOC fallback
  let host = "";
  if (typeof baseUrl === "string") {
    host = baseUrl.replace(/\/+$/, "");
  } else if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_URL_LOC
  ) {
    host = String(import.meta.env.VITE_URL_LOC).replace(/\/+$/, "");
  }

  return host ? `${host}${prefix}` : prefix;
}

/**
 * Parse a raw remark/reason string into clean text and an array of images.
 *
 * @param {string|null|undefined} raw
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 * @returns {{ text: string, images: Array<{ name: string, path: string, url: string }> }}
 */
export function parseCommentWithImages(raw, options = {}) {
  if (!raw || typeof raw !== "string") {
    return { text: "", images: [] };
  }

  const images = [];
  const regex = new RegExp(COMMENT_IMAGE_MARKDOWN_REGEX.source, "g");
  let match;

  while ((match = regex.exec(raw)) !== null) {
    const name = (match[1] || "").trim() || "image.png";
    const path = (match[2] || "").trim();
    if (path) {
      images.push({
        name,
        path,
        url: buildCommentImageUrl(path, options.baseUrl),
      });
    }
  }

  // Remove the image markdown tokens from the text
  const cleanText = raw.replace(new RegExp(COMMENT_IMAGE_MARKDOWN_REGEX.source, "g"), "").trim();

  return {
    text: cleanText,
    images,
  };
}

/**
 * Format comment text and attached images into a persisted comment string.
 *
 * @param {string} text
 * @param {Array<{ name?: string, fileName?: string, path?: string, filePath?: string }>} [images]
 * @returns {string}
 */
export function formatCommentWithImages(text = "", images = []) {
  const baseText = typeof text === "string" ? text.trim() : "";
  const validImages = Array.isArray(images)
    ? images.filter(img => Boolean(img && (img.path || img.filePath)))
    : [];

  if (validImages.length === 0) {
    return baseText;
  }

  const markdownTags = validImages.map(img => {
    const name = (img.name || img.fileName || "image.png").trim();
    const path = (img.path || img.filePath || "").trim();
    return `![${name}](${path})`;
  });

  if (!baseText) {
    return markdownTags.join("\n");
  }

  return `${baseText}\n\n${markdownTags.join("\n")}`;
}
