// Aplica sql/001_esquema.sql a la base de datos de DATABASE_URL.
import { readFileSync } from 'node:fs';
import { pool } from '../src/db.js';

const sql = readFileSync(new URL('../sql/001_esquema.sql', import.meta.url), 'utf8');
await pool.query(sql);
console.log('✓ Esquema aplicado');
await pool.end();
