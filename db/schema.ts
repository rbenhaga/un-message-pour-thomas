import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const birthdayMessages = sqliteTable('birthday_messages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  message: text('message').notNull(),
  font: text('font').notNull(),
  signatureMode: text('signature_mode').notNull(),
  signature: text('signature').notNull(),
  createdAt: text('created_at').notNull(),
});
