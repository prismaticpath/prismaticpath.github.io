// 1. Import your utilities and schemas
import { defineCollection, reference } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { rssSchema } from '@astrojs/rss'

// 2. Define your collections
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    rssSchema.extend({
      draft: z.boolean().optional(),
      author: reference('author').optional(),
      image: image().optional(),
      images: z.array(image()).optional(),
      gallery: z.string().optional(),
      categories: z.array(reference('category')).optional(),
      tags: z.array(z.string()).optional(),
      minutesRead: z.string().optional()
    })
})

const page = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/page' }),
  schema: ({ image }) =>
    z.object({
      draft: z.boolean().optional(),
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.date().optional(),
      author: reference('author').optional(),
      image: image().optional(),
      images: z.array(image()).optional(),
      gallery: z.string().optional(),
      tags: z.array(z.string()).optional()
    })
})

const category = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/category' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image()
    })
})

const author = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/author' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image(),
      contact: z.string()
    })
})

const social = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/social' }),
  schema: z.object({
    name: z.string(),
    link: z.string(),
    icon: z.string()
  })
})

// 3. Export multiple collections to register them
export const collections = {
  blog,
  page,
  category,
  author,
  social
}
