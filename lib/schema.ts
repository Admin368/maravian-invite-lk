import { pgTable, serial, varchar, text, decimal, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Existing tables inferred from your db.ts queries
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').notNull(),
  name: varchar('name').notNull(),
  isOrganizer: boolean('is_organizer').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  emailSent: boolean('email_sent').notNull().default(true),
  wechatId: varchar('wechat_id')
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  token: varchar('token').notNull(),
  isUsed: boolean('is_used').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const rsvps = pgTable('rsvps', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  status: varchar('status').notNull(),
  plusOne: boolean('plus_one').default(false),
  plusOneName: varchar('plus_one_name'),
  updatedAt: timestamp('updated_at').defaultNow(),
  joinedWechat: boolean('joined_wechat').default(false)
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// New tables for the restaurant menu system
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  rsvpId: integer("rsvp_id").references(() => rsvps.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Add relations
export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  rsvp: one(rsvps, {
    fields: [orders.rsvpId],
    references: [rsvps.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));