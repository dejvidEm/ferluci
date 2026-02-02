import { createClient } from '@sanity/client'

function getSanityConfig() {
  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET
  const token = process.env.SANITY_WRITE_TOKEN

  if (!projectId) {
    throw new Error('SANITY_PROJECT_ID is not set. Please add it to your environment variables.')
  }

  if (!dataset) {
    throw new Error('SANITY_DATASET is not set. Please add it to your environment variables.')
  }

  if (!token) {
    throw new Error('SANITY_WRITE_TOKEN is not set. Please add it to your environment variables.')
  }

  return {
    projectId,
    dataset,
    token,
    apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  }
}

// Create client lazily to avoid errors during build time
let _adminClient: ReturnType<typeof createClient> | null = null

function getAdminClient() {
  if (!_adminClient) {
    const config = getSanityConfig()
    _adminClient = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      useCdn: false,
      apiVersion: config.apiVersion,
      token: config.token,
    })
  }
  return _adminClient
}

// Export a proxy that lazily initializes the client only when accessed
export const adminClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getAdminClient()
    const value = client[prop as keyof typeof client]
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
