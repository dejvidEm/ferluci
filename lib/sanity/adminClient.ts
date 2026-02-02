import { createClient } from '@sanity/client'

if (!process.env.SANITY_PROJECT_ID) {
  throw new Error('SANITY_PROJECT_ID is not set')
}

if (!process.env.SANITY_DATASET) {
  throw new Error('SANITY_DATASET is not set')
}

if (!process.env.SANITY_WRITE_TOKEN) {
  throw new Error('SANITY_WRITE_TOKEN is not set')
}

export const adminClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
})
