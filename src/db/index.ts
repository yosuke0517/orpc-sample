import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// SQLiteデータベース接続
const sqlite = new Database('sqlite.db')

// Drizzle ORM インスタンス
export const db = drizzle(sqlite, { schema })

// 開発環境でのデバッグ用
if (process.env.NODE_ENV === 'development') {
  sqlite.pragma('journal_mode = WAL')
}