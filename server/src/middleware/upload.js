// src/middleware/upload.js
// Multer middleware for handling image uploads (stored in memory → S3)

import multer from "multer";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

const storage = multer.memoryStorage(); // keep in memory; grading handler uploads to S3

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload JPEG, PNG, or WebP.`), false);
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single("photo");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 10 },
}).array("photos", 10);

// Wrap multer to return a proper JSON error instead of HTML
export function multerMiddleware(type = "single") {
  return (req, res, next) => {
    const handler = type === "multiple" ? uploadMultiple : uploadSingle;
    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
}
