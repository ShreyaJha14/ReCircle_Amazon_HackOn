// src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.path}:`, err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again."
      : err.message || "Internal server error";

  return res.status(status).json({ error: message });
}

export function notFound(req, res) {
  return res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
