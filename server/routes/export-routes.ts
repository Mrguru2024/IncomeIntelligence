import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { exportFinancialData, scheduleExport, processScheduledExports } from '../services/export-service';

// Export routes registration
export function registerExportRoutes(app: Express): void {
  /**
   * Generate and download a financial export
   * Supports CSV and PDF formats for income, expenses, transactions, and summaries
   */
  app.post('/api/exports/generate', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        userId: z.string().or(z.number()),
        format: z.enum(['csv', 'pdf']),
        dataType: z.enum(['income', 'expenses', 'transactions', 'summary']),
        dateRange: z.object({
          startDate: z.string().or(z.date()),
          endDate: z.string().or(z.date())
        }).optional(),
        categories: z.array(z.string()).optional(),
        includeNotes: z.boolean().optional(),
        title: z.string().optional(),
        email: z.string().email().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Process date range if provided as strings
      if (validatedData.dateRange) {
        validatedData.dateRange = {
          startDate: new Date(validatedData.dateRange.startDate),
          endDate: new Date(validatedData.dateRange.endDate)
        };
      }
      
      // Generate the export
      const result = await exportFinancialData(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.error || 'Failed to generate export' 
        });
      }
      
      // If email was provided, we've already emailed the export
      if (validatedData.email) {
        return res.json({ 
          success: true, 
          message: `Export sent to ${validatedData.email}` 
        });
      }
      
      // Determine content type for download
      const contentType = validatedData.format === 'csv' 
        ? 'text/csv' 
        : 'application/pdf';
      
      // Set headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      // Send the data
      return res.send(result.data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error('Error generating export:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error generating export' 
      });
    }
  });
  
  /**
   * Schedule regular exports via email
   */
  app.post('/api/exports/schedule', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        userId: z.string().or(z.number()),
        email: z.string().email(),
        frequency: z.enum(['weekly', 'biweekly', 'monthly']),
        dataType: z.enum(['income', 'expenses', 'transactions', 'summary']),
        format: z.enum(['csv', 'pdf']),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Schedule the export
      const result = await scheduleExport(
        validatedData.userId,
        validatedData.email,
        validatedData.frequency,
        validatedData.dataType,
        validatedData.format
      );
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: result.error || 'Failed to schedule export' 
        });
      }
      
      return res.json({
        success: true,
        message: result.message || 'Export scheduled successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error('Error scheduling export:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error scheduling export' 
      });
    }
  });
  
  /**
   * Get scheduled exports for a user
   */
  app.get('/api/exports/scheduled/:userId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }
      
      const scheduledExports = await req.app.locals.storage.getScheduledExportsByUserId(userId);
      
      return res.json({
        success: true,
        data: scheduledExports
      });
    } catch (error) {
      console.error('Error getting scheduled exports:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error getting scheduled exports' 
      });
    }
  });
  
  /**
   * Update a scheduled export
   */
  app.patch('/api/exports/scheduled/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid scheduled export ID' 
        });
      }
      
      // Validate the request body
      const schema = z.object({
        email: z.string().email().optional(),
        frequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
        dataType: z.enum(['income', 'expenses', 'transactions', 'summary']).optional(),
        format: z.enum(['csv', 'pdf']).optional(),
        isActive: z.boolean().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Update the scheduled export
      const updatedExport = await req.app.locals.storage.updateScheduledExport(id, validatedData);
      
      if (!updatedExport) {
        return res.status(404).json({ 
          success: false, 
          message: 'Scheduled export not found' 
        });
      }
      
      return res.json({
        success: true,
        data: updatedExport,
        message: 'Scheduled export updated successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      }
      
      console.error('Error updating scheduled export:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error updating scheduled export' 
      });
    }
  });
  
  /**
   * Delete a scheduled export
   */
  app.delete('/api/exports/scheduled/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid scheduled export ID' 
        });
      }
      
      // Delete the scheduled export
      const success = await req.app.locals.storage.deleteScheduledExport(id);
      
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: 'Scheduled export not found or could not be deleted' 
        });
      }
      
      return res.json({
        success: true,
        message: 'Scheduled export deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting scheduled export:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error deleting scheduled export' 
      });
    }
  });
  
  /**
   * Manually trigger processing of scheduled exports (primarily for testing)
   * This would normally be triggered by a cron job
   */
  app.post('/api/exports/process-scheduled', async (req: Request, res: Response) => {
    try {
      const result = await processScheduledExports();
      
      return res.json({
        success: result.success,
        processedCount: result.processedCount,
        message: result.success 
          ? `Successfully processed ${result.processedCount} scheduled exports` 
          : result.error || 'Failed to process scheduled exports'
      });
    } catch (error) {
      console.error('Error processing scheduled exports:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error processing scheduled exports' 
      });
    }
  });
}