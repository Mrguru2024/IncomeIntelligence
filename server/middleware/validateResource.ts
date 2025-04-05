import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Middleware to validate request against a Zod schema
 * 
 * @param schema Zod schema to validate request against
 * @param source Request property to validate ('body', 'query', 'params')
 * @returns Express middleware function
 */
export const validateResource = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the source against the schema
      const data = schema.parse(req[source]);
      
      // Replace the request data with the validated data
      // This ensures type safety and removes any extraneous fields
      req[source] = data;
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Convert ZodError to a more user-friendly format
        const validationError = fromZodError(error);
        
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationError.details.map(detail => ({
            path: detail.path,
            message: detail.message
          }))
        });
      }
      
      // Pass other errors to the error handler
      next(error);
    }
  };
};

/**
 * Simplified validation middleware for simple validations
 * 
 * @param validator Function that validates the request and returns errors if any
 * @returns Express middleware function
 */
export const simpleValidate = (
  validator: (req: Request) => string[] | null
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validator(req);
    
    if (errors && errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

/**
 * Validate that required fields are present and not empty
 * 
 * @param fields Array of field names to validate in request body
 * @returns Express middleware function
 */
export const validateRequiredFields = (fields: string[]) => {
  return simpleValidate((req: Request) => {
    const errors: string[] = [];
    
    fields.forEach(field => {
      const value = req.body[field];
      
      if (value === undefined || value === null || value === '') {
        errors.push(`${field} is required`);
      }
    });
    
    return errors.length > 0 ? errors : null;
  });
};