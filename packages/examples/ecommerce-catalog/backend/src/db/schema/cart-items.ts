import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { products } from './products'

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: text('session_id').notNull(), // Anonymous session ID (UUID)
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  price_cents: integer('price_cents').notNull(), // Snapshot price at time of add
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  expires_at: integer('expires_at', { mode: 'timestamp' }).notNull() // 7 days from creation
})

// Index for efficient session lookups
// Note: Created via raw SQL in migration
export const cartItemsIndexes = `
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_expires ON cart_items(expires_at);
`
