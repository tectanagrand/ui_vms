import { Delete } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import AttachmentPreviewDialog from "src/components/common/AttachmentPreviewDialog";
import useAxiosPrivate from "src/hooks/useAxiosPrivate";
import {
  buildCommentImageUrl,
  isAllowedCommentImageFile,
} from "src/helper/commentWithImages.js";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Image attachment bar matching the standard MMS Attachment UI.
 * Allows selecting multiple image files simultaneously without quantity limit,
 * plus clipboard paste (Ctrl+V) support.
 *
 * @param {object} props
 * @param {Array<{ name: string, path: string, url?: string, size?: number }>} props.images - Attached images
 * @param {(images: Array<{ name: string, path: string, url?: string, size?: number }>) => void} props.onChange
 * @param {boolean} [props.disabled] - Whether submitting or disabled
 * @param {(uploading: boolean) => void} [props.onUploadingChange] - Notify parent of upload state
 */
export default function CommentImageInput({
  images = [],
  onChange,
  disabled = false,
  onUploadingChange,
}) {
  const axiosPrivate = useAxiosPrivate();
  const fileInputRef = useRef(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errorText, setErrorText] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isUploading = uploadingCount > 0;

  const updateUploadingCount = useCallback(
    delta => {
      setUploadingCount(prev => {
        const next = Math.max(0, prev + delta);
        onUploadingChange?.(next > 0);
        return next;
      });
    },
    [onUploadingChange]
  );

  const uploadSingleFile = useCallback(
    async file => {
      if (!file) return null;

      if (!isAllowedCommentImageFile(file.type || file.name)) {
        throw new Error(
          `Format "${file.name}" tidak didukung. Gunakan PNG, JPG, JPEG, GIF, atau WEBP.`
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `Ukuran "${file.name}" melebihi batas maksimal 10MB.`
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosPrivate.post("/material/comments/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response?.data?.data;
      if (data?.filePath) {
        return {
          name: data.fileName || file.name || "image.png",
          path: data.filePath,
          url: buildCommentImageUrl(data.filePath),
          size: file.size || data.size,
        };
      }
      throw new Error(`Gagal menyimpan file "${file.name}".`);
    },
    [axiosPrivate]
  );

  const handleUploadBatch = useCallback(
    async (fileList) => {
      if (!fileList || fileList.length === 0) return;

      setErrorText("");
      updateUploadingCount(fileList.length);

      const successfulUploads = [];
      const errorMessages = [];

      for (const file of fileList) {
        try {
          const uploaded = await uploadSingleFile(file);
          if (uploaded) {
            successfulUploads.push(uploaded);
          }
        } catch (err) {
          console.error("Gagal mengupload file gambar komentar:", err);
          errorMessages.push(
            err?.response?.data?.message || err.message || "Gagal mengupload file."
          );
        } finally {
          updateUploadingCount(-1);
        }
      }

      if (successfulUploads.length > 0) {
        onChange?.([...images, ...successfulUploads]);
      }

      if (errorMessages.length > 0) {
        setErrorText(errorMessages.join(" | "));
      }
    },
    [images, onChange, updateUploadingCount, uploadSingleFile]
  );

  const handleFileChange = e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    handleUploadBatch(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = indexToRemove => {
    const next = images.filter((_, idx) => idx !== indexToRemove);
    onChange?.(next);
  };

  const handlePreviewImage = (img, e) => {
    e.stopPropagation();
    setPreviewFile({
      name: img.name || "image.png",
      url: img.url || buildCommentImageUrl(img.path),
      type: "image/png",
    });
    setPreviewOpen(true);
  };

  // Clipboard paste listener: handles multiple pasted images without limit
  useEffect(() => {
    const handlePaste = event => {
      if (disabled || isUploading) return;
      const clipboardData = event.clipboardData;
      if (!clipboardData || !clipboardData.items) return;

      const items = Array.from(clipboardData.items);
      const imageFiles = items
        .filter(it => it.type && it.type.startsWith("image/"))
        .map(it => it.getAsFile())
        .filter(Boolean);

      if (imageFiles.length > 0) {
        event.preventDefault();
        handleUploadBatch(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [disabled, isUploading, handleUploadBatch]);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        bgcolor: "#fbfcfe",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Attachment
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Format: PNG, JPG, JPEG, GIF, WEBP · Maks. 10MB per file
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept=".png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          {isUploading && <CircularProgress size={20} />}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            sx={{ textTransform: "none", px: 2.5, py: 0.75, fontWeight: 700, bgcolor: "common.white" }}
          >
            {isUploading ? `Uploading (${uploadingCount})...` : "Browsing File"}
          </Button>
        </Box>
      </Box>

      {isUploading && (
        <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
      )}

      {errorText && (
        <Alert severity="error" sx={{ mt: 1.5, py: 0.5, fontSize: "0.82rem" }}>
          {errorText}
        </Alert>
      )}

      {images.length > 0 && (
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
          {images.map((img, index) => {
            const fileUrl = img.url || buildCommentImageUrl(img.path);
            const ext = img.name && img.name.includes(".")
              ? img.name.split(".").pop().toUpperCase()
              : "IMG";

            return (
              <Paper
                key={`${img.path}-${index}`}
                elevation={0}
                onClick={e => handlePreviewImage(img, e)}
                title="Click to view file"
                sx={{
                  width: { xs: "100%", sm: 280 },
                  p: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  cursor: "pointer",
                  bgcolor: "#fbfcfe",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 1.5,
                    bgcolor: "#edf4ff",
                    color: "#2457c5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                    fontWeight: 900,
                    fontSize: "0.72rem",
                  }}
                >
                  {ext}
                  {fileUrl && (
                    <Box
                      component="img"
                      src={fileUrl}
                      alt={img.name}
                      onError={e => {
                        e.target.style.opacity = "0.15";
                        e.target.style.filter = "grayscale(100%)";
                      }}
                      sx={{
                        width: 52,
                        height: 52,
                        objectFit: "cover",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
                    {img.name || `Attachment ${index + 1}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                    {formatFileSize(img.size) || "Image"}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  disabled={disabled || isUploading}
                  onClick={event => {
                    event.stopPropagation();
                    setDeleteTarget({ index, name: img.name || `Attachment ${index + 1}` });
                  }}
                  sx={{ flexShrink: 0 }}
                  aria-label={`Remove ${img.name}`}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            );
          })}
        </Stack>
      )}

      <AttachmentPreviewDialog
        open={previewOpen}
        file={previewFile}
        onClose={() => setPreviewOpen(false)}
        hideDownload
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Remove Attachment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove &ldquo;{deleteTarget?.name}&rdquo;?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (deleteTarget !== null) {
                handleRemoveImage(deleteTarget.index);
              }
              setDeleteTarget(null);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
