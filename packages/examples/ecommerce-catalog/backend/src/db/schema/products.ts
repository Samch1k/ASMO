import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { categories } from './categories'

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  short_description: text('short_description'),
  price_cents: integer('price_cents').notNull(), // Store as cents to avoid floating point issues
  currency: text('currency').notNull().default('USD'),
  category_id: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  image_url: text('image_url'),
  images: text('images'), // JSON array of additional images
  sku: text('sku').notNull().unique(),
  weight_grams: integer('weight_grams'),
  dimensions: text('dimensions'), // JSON: {length, width, height}
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  tags: text('tags'), // JSON array of tags
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

// FTS5 virtual table for full-text search
// Note: This is created via raw SQL in migration since Drizzle doesn't support FTS5 directly
export const productsFts = `
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  name,
  description,
  short_description,
  tags,
  content='products',
  content_rowid='id'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, description, short_description, tags)
  VALUES (new.id, new.name, new.description, new.short_description, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
  UPDATE products_fts SET
    name = new.name,
    description = new.description,
    short_description = new.short_description,
    tags = new.tags
  WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.id;
END;
`
