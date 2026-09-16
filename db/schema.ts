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
  email: text("email").notNull(),
  message: text("message").notNull(),
  propertyId: text("property_id").references(() => properties.id, { onDelete: "set null" }),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  createdAtIdx: index("leads_created_at_idx").on(table.createdAt),
}))
