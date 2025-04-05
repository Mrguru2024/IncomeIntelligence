import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware that validates request data against a Zod schema
 * @param schema Zod schema to validate against
 */
const validateResource = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request against the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        // Format validation errors in a user-friendly way
        const errorMessages = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errorMessages
        });
      }
      
      // Handle any other unexpected errors
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation'
      });
    }
  };

export default validateResource;