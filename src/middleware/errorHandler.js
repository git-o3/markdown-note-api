import logger from "../utils/logger.js";

export const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.messsage = err.messsage;

    logger.error(`${err.name}: ${err.messsage}`);

    
    if (err.name === "CaseError") {
        error.messsage = "Resource not found";
        return res.status(404).json({ success: false, error: error.messsage });
    }

    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(4000).json({ success: false, error: message });
    }

    console.error("CRASH DETAILS:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    });
};
