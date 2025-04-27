import { Router } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware/authMiddleware';
import { expenseCategories } from '../../shared/schema';

const router = Router();

// Schema endpoints - expose schema information to the client
router.get("/api/schema/expense-categories", (req, res) => {
  res.json({ expenseCategories });
});

// Spending limits API endpoints
router.get("/api/spending-limits", requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        "SELECT * FROM spending_limits WHERE user_id = $1 ORDER BY category",
        [userId]
      );
      
      res.json({
        limits: result.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          category: row.category,
          limitAmount: parseFloat(row.limit_amount),
          cycle: row.cycle,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isActive: row.is_active
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching spending limits:", error);
    res.status(500).json({ error: "Failed to fetch spending limits" });
  }
});

router.post("/api/spending-limits", requireAuth, async (req, res) => {
  try {
    // If userId not in body, use authenticated user id
    const userId = req.body.userId || req.user?.id;
    const { category, limitAmount, cycle, isActive } = req.body;
    
    if (!userId || !category || !limitAmount || !cycle) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if a limit for this category and cycle already exists
      const existingResult = await client.query(
        "SELECT id FROM spending_limits WHERE user_id = $1 AND category = $2 AND cycle = $3",
        [userId, category, cycle]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(409).json({ 
          error: "A spending limit for this category and cycle already exists" 
        });
      }
      
      const result = await client.query(
        `INSERT INTO spending_limits 
         (user_id, category, limit_amount, cycle, is_active) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, category, limitAmount, cycle, isActive === undefined ? true : isActive]
      );
      
      const newLimit = result.rows[0];
      
      res.status(201).json({
        id: newLimit.id,
        userId: newLimit.user_id,
        category: newLimit.category,
        limitAmount: parseFloat(newLimit.limit_amount),
        cycle: newLimit.cycle,
        createdAt: newLimit.created_at,
        updatedAt: newLimit.updated_at,
        isActive: newLimit.is_active
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating spending limit:", error);
    res.status(500).json({ error: "Failed to create spending limit" });
  }
});

router.put("/api/spending-limits/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // If userId not in body, use authenticated user id
    const userId = req.body.userId || req.user?.id;
    const { category, limitAmount, cycle, isActive } = req.body;
    
    if (!userId || !category || !limitAmount || !cycle) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const client = await pool.connect();
    
    try {
      // Check if the limit exists and belongs to the user
      const checkResult = await client.query(
        "SELECT id FROM spending_limits WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Spending limit not found" });
      }
      
      // Check if updating to a category+cycle that already exists (but not this one)
      const existingResult = await client.query(
        "SELECT id FROM spending_limits WHERE user_id = $1 AND category = $2 AND cycle = $3 AND id != $4",
        [userId, category, cycle, id]
      );
      
      if (existingResult.rows.length > 0) {
        return res.status(409).json({ 
          error: "Another spending limit for this category and cycle already exists" 
        });
      }
      
      const result = await client.query(
        `UPDATE spending_limits 
         SET category = $1, limit_amount = $2, cycle = $3, is_active = $4, updated_at = NOW() 
         WHERE id = $5 AND user_id = $6 
         RETURNING *`,
        [category, limitAmount, cycle, isActive, id, userId]
      );
      
      const updatedLimit = result.rows[0];
      
      res.json({
        id: updatedLimit.id,
        userId: updatedLimit.user_id,
        category: updatedLimit.category,
        limitAmount: parseFloat(updatedLimit.limit_amount),
        cycle: updatedLimit.cycle,
        createdAt: updatedLimit.created_at,
        updatedAt: updatedLimit.updated_at,
        isActive: updatedLimit.is_active
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating spending limit:", error);
    res.status(500).json({ error: "Failed to update spending limit" });
  }
});

router.delete("/api/spending-limits/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    
    const client = await pool.connect();
    
    try {
      // First check if the limit exists and belongs to the user
      const checkResult = await client.query(
        "SELECT id FROM spending_limits WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Spending limit not found" });
      }
      
      await client.query(
        "DELETE FROM spending_limits WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      
      res.status(204).send();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting spending limit:", error);
    res.status(500).json({ error: "Failed to delete spending limit" });
  }
});

// Spending history endpoints
router.get("/api/spending-history", requireAuth, async (req, res) => {
  try {
    const userId = req.query.userId as string || req.user?.id;
    const { category, startDate, endDate } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    
    const client = await pool.connect();
    
    try {
      let query = "SELECT * FROM spending_logs WHERE user_id = $1";
      const queryParams = [userId];
      
      // Add optional filters
      if (category) {
        query += " AND category = $" + (queryParams.length + 1);
        queryParams.push(category as string);
      }
      
      if (startDate) {
        query += " AND timestamp >= $" + (queryParams.length + 1);
        queryParams.push(startDate as string);
      }
      
      if (endDate) {
        query += " AND timestamp <= $" + (queryParams.length + 1);
        queryParams.push(endDate as string);
      }
      
      query += " ORDER BY timestamp DESC";
      
      const result = await client.query(query, queryParams);
      
      res.json({
        history: result.rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          category: row.category,
          amountSpent: parseFloat(row.amount_spent),
          description: row.description,
          source: row.source,
          timestamp: row.timestamp,
          createdAt: row.created_at
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching spending history:", error);
    res.status(500).json({ error: "Failed to fetch spending history" });
  }
});

// Initialize Guardrails tables if needed
router.post("/api/admin/init-guardrails", requireAuth, async (req, res) => {
  try {
    // Check if user is an admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin access required to initialize Guardrails tables'
      });
    }

    const { createGuardrailsTables } = await import('../create-guardrails-tables');
    await createGuardrailsTables();
    
    res.json({ 
      success: true, 
      message: 'Guardrails tables initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing Guardrails tables:', error);
    res.status(500).json({ 
      error: 'Failed to initialize Guardrails tables',
      message: error.message || 'Unknown error occurred'
    });
  }
});

export default router;