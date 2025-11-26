// server/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const status = err.status || 500;
    const message = process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
};
