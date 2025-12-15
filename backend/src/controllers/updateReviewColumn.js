import dotenv from 'dotenv';
dotenv.config();

import pool from '../db.js';

async function changeRatingToFloat() { 
  try {

    await pool.query('BEGIN');

    // Очистка "битых" записей
    await pool.query('DELETE FROM films_in_group WHERE added_by_id NOT IN (SELECT user_id FROM "User")');
    await pool.query('DELETE FROM group_member WHERE user_id NOT IN (SELECT user_id FROM "User")');
    await pool.query('DELETE FROM group_request WHERE user_id NOT IN (SELECT user_id FROM "User")');

    // Удаляем старый FK
    await pool.query('ALTER TABLE films_in_group DROP CONSTRAINT IF EXISTS films_in_group_added_by_id_fkey');

    // Добавляем FK с CASCADE
    await pool.query(`
      ALTER TABLE films_in_group
      ADD CONSTRAINT films_in_group_added_by_id_fkey
      FOREIGN KEY (added_by_id) REFERENCES "User"(user_id)
      ON DELETE CASCADE
    `);
<<<<<<< Updated upstream
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
=======

    // Сбрасываем sequence
    await pool.query(`SELECT setval('group_request_group_request_id_seq', 1, false)`);

    await pool.query('COMMIT');

    console.log('✅ База успешно очищена и sequence сброшены');

    //console.log("Column 'rating' updated to NUMERIC(3,1)");
>>>>>>> Stashed changes
  } catch (err) {
    console.error("Error updating column:", err);
  } finally {
    await pool.end();
  }
}

changeRatingToFloat();