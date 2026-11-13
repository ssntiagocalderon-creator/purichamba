import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export const consulta = (texto, valores) => pool.query(texto, valores);

// pgvector recibe los vectores como texto '[0.1,0.2,...]'
export const aVector = (arreglo) => (arreglo ? `[${arreglo.join(',')}]` : null);
