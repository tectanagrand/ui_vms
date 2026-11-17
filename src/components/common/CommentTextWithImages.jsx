import { Box, Paper, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import AttachmentPreviewDialog from "src/components/common/AttachmentPreviewDialog";
import { parseCommentWithImages } from "src/helper/commentWithImages.js";

/**
 * Renders comment text and any embedded/attached images.
 * Clicking an image thumbnail opens the shared AttachmentPreviewDialog.
 *
 * @param {object} props
 * @param {string} props.text - The raw comment/remark string
 * @param {"left"|"center"|"right"} [props.align] - Text alignment
 * @param {string} [props.variant] - Typography variant (default: "body2")
 * @param {string} [props.color] - Typography color (default: "text.primary")
 * @param {object} [props.sx] - Additional SX styles
 * @param {number} [props.thumbnailSize] - Thumbnail box size in px (default: 56)
 */
export default function CommentTextWithImages({
  text = "",
  align = "left",
  variant = "body2",
  color = "text.primary",
  sx = {},
  thumbnailSize = 56,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const { text: cleanText, images } = useMemo(
    () => parseCommentWithImages(text),
    [text]
  );

  const handleImageClick = (img, e) => {
    e.stopPropagation();
    setPreviewFile({
      name: img.name || "image.png",
      url: img.url,
      type: "image/png",
    });
    setPreviewOpen(true);
  };

  const hasText = Boolean(cleanText && cleanText !== "-");
  const hasImages = images.length > 0;

  if (!hasText && !hasImages) {
    return (
      <Typography variant={variant} color="text.secondary" sx={{ textAlign: align, ...sx }}>
        -
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%", ...sx }}>
      {hasText && (
        <Typography
          variant={variant}
          color={color}
          sx={{
            textAlign: align,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {cleanText}
        </Typography>
      )}

      {hasImages && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent={align === "right" ? "flex-end" : "flex-start"}
          sx={{ mt: hasText ? 1 : 0 }}
        >
          {images.map((img, idx) => (
            <Paper
              key={`${img.path}-${idx}`}
              elevation={0}
              onClick={e => handleImageClick(img, e)}
              title={`${img.name} (Click to preview)`}
              sx={{
                width: thumbnailSize,
                height: thumbnailSize,
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                position: "relative",
                bgcolor: "#f0f4f8",
                flexShrink: 0,
                transition: "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  transform: "scale(1.04)",
                  boxShadow: 2,
                },
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt={img.name}
                loading="lazy"
                onError={e => {
                  e.target.style.opacity = "0.2";
                  e.target.style.filter = "grayscale(100%)";
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Paper>
          ))}
        </Stack>
      )}

      <AttachmentPreviewDialog
        open={previewOpen}
        file={previewFile}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
}
