/**
 * errorHandler — Centralized Express error-handling middleware.
 * 
 * MUST be the LAST app.use() in index.js (Express identifies error handlers
 * by their 4-argument signature: err, req, res, next).
 * 
 * In DEVELOPMENT: Returns full error stack for debugging.
 * In PRODUCTION: Returns a generic message. No stack traces, no file paths,
 *               no DB query details are ever sent to the client.
 * 
 * Controllers use `next(error)` to delegate to this handler instead of
 * writing manual `res.status(500).json(...)` blocks everywhere.
 */
const errorHandler = (err, req, res, next) => {
    // Always log internally (for monitoring/alerting systems)
    console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === "development") {
        return res.status(statusCode).json({
            success: false,
            message: err.message || "Internal server error.",
            stack: err.stack,
        });
    }

    // Production: Never reveal internal details
    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 
            ? "Something went wrong. Please try again later." 
            : err.message,
    });
};

export default errorHandler;
