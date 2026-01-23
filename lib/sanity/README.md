# Sanity CMS Integration

This directory contains all Sanity CMS integration code for fetching vehicle data.

## Files

- `client.ts` - Sanity client configuration
- `image.ts` - Image URL builder helper
- `queries.ts` - GROQ queries for fetching vehicles
- `utils.ts` - Utility functions for transforming Sanity data to app types

## Environment Variables

Make sure you have these environment variables set in your `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=23k43zo9
NEXT_PUBLIC_SANITY_DATASET=production
```

## Usage

### Fetching all vehicles

```typescript
import { client, vehiclesQuery } from '@/lib/sanity'
import { transformSanityVehicle } from '@/lib/sanity/utils'

const data = await client.fetch(vehiclesQuery)
const vehicles = data.map(transformSanityVehicle)
```

### Fetching a single vehicle by ID

```typescript
import { client, vehicleByIdQuery } from '@/lib/sanity'
import { transformSanityVehicle } from '@/lib/sanity/utils'

const data = await client.fetch(vehicleByIdQuery, { id: 'vehicle-id' })
const vehicle = transformSanityVehicle(data)
```

### Generating image URLs

```typescript
import { urlFor } from '@/lib/sanity/image'

const imageUrl = urlFor(sanityImage).width(800).height(600).url()
```

## Schema

The vehicle schema is defined in `/ferlucicars/schemaTypes/vehicle.ts`. Make sure to deploy it to Sanity Studio.






