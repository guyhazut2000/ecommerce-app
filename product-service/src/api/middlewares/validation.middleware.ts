import { NextFunction,Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data based on schema
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      // Handle other errors
      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

// Specific validation middlewares for common patterns
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: "Invalid request body",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: "Invalid URL parameters",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
};
