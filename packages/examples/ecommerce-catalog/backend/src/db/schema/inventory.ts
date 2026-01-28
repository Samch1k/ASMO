import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { products } from './products'

export const inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }).unique(),
  quantity: integer('quantity').notNull().default(0),
  reserved: integer('reserved').notNull().default(0), // Items in carts but not purchased
  available: integer('available').notNull().default(0), // Computed: quantity - reserved
  low_stock_threshold: integer('low_stock_threshold').default(10),
  restocking_date: integer('restocking_date', { mode: 'timestamp' }),
  supplier_id: text('supplier_id'),
  location: text('location'),
  notes: text('notes'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})
