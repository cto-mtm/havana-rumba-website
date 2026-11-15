import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const menuItem = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string()
})

const menuSection = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(menuItem),
  notes: z.array(z.string())
})

export default defineContentConfig({
  collections: {
    news: defineCollection({
      type: 'page',
      source: 'news/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        image: z.string().optional(),
        category: z.string().optional()
      })
    }),

    // One file per location: content/menus/<location-slug>.json
    // Rendered as HTML on the location page so Google can index dishes
    // (3 of 4 menus on the old site were images only).
    menus: defineCollection({
      type: 'data',
      source: 'menus/*.json',
      schema: z.object({
        location: z.string(),
        source: z.string().optional(),
        capturedAt: z.string().optional(),
        sections: z.array(menuSection)
      })
    })
  }
})
