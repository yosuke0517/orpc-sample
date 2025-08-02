import { Pool } from 'pg'

// PostgreSQL接続プール
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'orpc_todos',
  user: process.env.DB_USER || 'dev_user',
  password: process.env.DB_PASSWORD || 'dev_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export { pool as db }