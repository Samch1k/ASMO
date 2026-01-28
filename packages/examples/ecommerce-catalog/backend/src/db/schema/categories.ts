import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parent_id: integer('parent_id').references(() => categories.id, { onDelete: 'cascade' }),
  image_url: text('image_url'),
  display_order: integer('display_order').default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})
