import dotenv from 'dotenv';
dotenv.config();

import pool from '../db.js';

async function changeRatingToFloat() { 
  try {
    await pool.query(`
      ALTER TABLE "review" 
      ALTER COLUMN media_type SET DEFAULT 'movie';
    `);
    /*await pool.query('DELETE FROM "review";');
    await pool.query('ALTER SEQUENCE "review_review_id_seq" RESTART WITH 1;');
    await pool.query(`
      ALTER TABLE "review"
      ALTER COLUMN rating TYPE NUMERIC(3,1)
      USING rating::NUMERIC;
    `);
    await pool.query(`
      ALTER TABLE "review" 
      ADD COLUMN IF NOT EXISTS media_type TEXT
      CHECK (media_type IN ('movie', 'tv'));
    `);*/
    console.log("Column 'rating' updated to NUMERIC(3,1)");
  } catch (err) {
    console.error("Error updating column:", err);
  } finally {
    await pool.end();
  }
}

changeRatingToFloat();