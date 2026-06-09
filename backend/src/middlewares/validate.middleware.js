//controller tak bad data nahi jana chyie

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }))
        });
    }
    req.validated = result.data; // Attach the validated data to the request object for use in controllers
    next();
};


// env = config guard
// logger = app diary
// morgan = request watcher
// constants = shared dictionary
// zod middleware = request gatekeeper