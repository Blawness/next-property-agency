import {
  pgTable,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["buyer", "agent", "admin"])
export const propertyTypeEnum = pgEnum("property_type", [
  "rumah",
  "apartemen",
  "tanah",
  "ruko",
])
export const listingTypeEnum = pgEnum("listing_type", ["jual", "sewa"])
export const statusEnum = pgEnum("status", ["active", "sold", "rented", "archived"])

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role").default("buyer"),
  // Shown on the public agent profile. Nullable so existing rows — and the
  // sibling site sharing this database — are unaffected.
  title: text("title"),
  bio: text("bio"),
  // Sessions are JWTs with no server-side store, so a password change cannot
  // revoke them directly. The JWT callback compares its issue time against
  // this, which is what actually logs an intruder out after a reset.
  passwordChangedAt: timestamp("password_changed_at"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const properties = pgTable("properties", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 15, scale: 0 }).notNull(),
  type: propertyTypeEnum("type").notNull(),
  listingType: listingTypeEnum("listing_type").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  landArea: integer("land_area"),
  buildingArea: integer("building_area"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  agentId: text("agent_id").references(() => profiles.id),
  status: statusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  // Bumped on every admin edit so sitemap.xml can report a truthful
  // `lastModified` — `createdAt` told crawlers listings never change.
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  // The public catalog always filters on status + deletedAt, then sorts by
  // either createdAt (default) or price. One composite index per sort key.
  activeCreatedIdx: index("properties_active_created_idx").on(
    table.status,
    table.deletedAt,
    table.createdAt,
  ),
  activePriceIdx: index("properties_active_price_idx").on(
    table.status,
    table.deletedAt,
    table.price,
  ),
  cityIdx: index("properties_city_idx").on(table.city),
  typeIdx: index("properties_type_idx").on(table.type),
  agentIdx: index("properties_agent_id_idx").on(table.agentId),
}))

export const propertyImages = pgTable("property_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  order: integer("order").default(0),
}, (table) => ({
  propertyIdx: index("property_images_property_id_idx").on(table.propertyId),
}))

export const favorites = pgTable("favorites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  propertyId: text("property_id").references(() => properties.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserProperty: uniqueIndex("unique_user_property").on(table.userId, table.propertyId),
}))

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    resetAt: timestamp("reset_at").notNull(),
  },
  (table) => ({
    resetAtIdx: index("rate_limits_reset_at_idx").on(table.resetAt),
  }),
)

export const adminActions = pgTable("admin_actions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id").references(() => profiles.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  createdAtIdx: index("admin_actions_created_at_idx").on(table.createdAt),
}))

export const leads = pgTable("leads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  // Phone carries the lead now — Indonesian buyers are reached on WhatsApp, not
  // email. Nullable in the database because rows predating this change have
  // none; the API schema is what requires it going forward.
  phone: text("phone"),
  email: text("email"),
  message: text("message").notNull(),
  propertyId: text("property_id").references(() => properties.id, { onDelete: "set null" }),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  createdAtIdx: index("leads_created_at_idx").on(table.createdAt),
}))

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // SHA-256 of the token, never the token itself. This database is shared
    // with a sibling project, so read access to this table must not be enough
    // to take over an account.
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tokenHashIdx: index("password_reset_tokens_token_hash_idx").on(table.tokenHash),
    userIdx: index("password_reset_tokens_user_id_idx").on(table.userId),
  }),
)
