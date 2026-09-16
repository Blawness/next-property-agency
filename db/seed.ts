import "dotenv/config"

import { db } from "./index"
import { profiles, properties, propertyImages, favorites } from "./schema"
import { agents, cities, propertyData, photoIdByProperty } from "./seed-data"

async function seed() {
  console.log("Starting database seeding...")

  // Cleanup existing data (order matters due to foreign keys)
  console.log("Cleaning up existing data...")
  await db.delete(favorites)
  await db.delete(propertyImages)
  await db.delete(properties)
  await db.delete(profiles)

  // Insert agents
  console.log("Inserting agent profiles...")
  const insertedAgents = await db.insert(profiles).values(agents).returning()

  // Assign agent IDs to properties (distribute evenly)
  const agentIds = insertedAgents.map((agent) => agent.id)
  propertyData.forEach((property, index) => {
    property.agentId = agentIds[index % agentIds.length]
  })

  // Add coordinates to properties based on city
  propertyData.forEach((property) => {
    const cityData = cities.find((c) => c.name === property.city)
    if (cityData) {
      // Add some random variation to coordinates
      const latVariation = (Math.random() - 0.5) * 0.01
      const lngVariation = (Math.random() - 0.5) * 0.01
      property.lat = (cityData.lat + latVariation).toString()
      property.lng = (cityData.lng + lngVariation).toString()
    }
  })

  // Insert properties
  console.log("Inserting properties...")
  const insertedProperties = await db.insert(properties).values(propertyData).returning()

  // Insert images — verified Unsplash photo IDs per property
  console.log("Inserting property images...")
  const imageData = insertedProperties.map((property) => ({
    propertyId: property.id,
    url: `https://images.unsplash.com/photo-${photoIdByProperty[property.title] ?? "1564013799919-ab600027ffc6"}?w=800&h=600&fit=crop&auto=format`,
    isPrimary: true,
    order: 0,
  }))

  await db.insert(propertyImages).values(imageData)

  console.log(
    `Seeded ${insertedAgents.length} agents, ${insertedProperties.length} properties, and ${imageData.length} images.`
  )
}

seed().catch(console.error)
