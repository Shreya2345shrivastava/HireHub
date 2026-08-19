import { z } from "zod";

/**
 * validate — Express middleware factory that validates req.body against a Zod schema.
 * 
 * Usage: router.post('/register', validate(registerSchema), controller)
 * 
 * On failure: Returns 422 Unprocessable Entity with field-level error messages.
 * On success: Attaches the parsed (type-safe) data to req.validatedData and calls next().
 */
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));

        return res.status(422).json({
            success: false,
            message: "Validation failed. Please check your input.",
            errors,
        });
    }

    // Attach validated + sanitized data so controllers use clean data, not raw req.body
    req.validatedData = result.data;
    next();
};
