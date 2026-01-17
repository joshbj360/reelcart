// server/database/slugExtension.ts
import { Prisma } from '../../prisma/generated/client'
import { generateUniqueSlug } from '../utils/slugify'

export const slugExtension = Prisma.defineExtension({
  name: 'slugExtension',
  model: {
    products: {
      async create({ args, query }: any) {
        if (args.data.title) {
          args.data.slug = await generateUniqueSlug('products', args.data.title)
        }
        return query(args)
      },
      async update({ args, query }: any) {
        if (args.data.title && typeof args.data.title === 'string') {
          const id = args.where?.id
          args.data.slug = await generateUniqueSlug('products', args.data.title, id)
        }
        return query(args)
      },
    },
    category: {
      async create({ args, query }: any) {
        if (args.data.name) {
          args.data.slug = await generateUniqueSlug('category', args.data.name)
        }
        return query(args)
      },
      async update({ args, query }: any) {
        if (args.data.name && typeof args.data.name === 'string') {
          const id = args.where?.id
          args.data.slug = await generateUniqueSlug('category', args.data.name, id)
        }
        return query(args)
      },
    },
    sellerProfile: {
      async create({ args, query }: any) {
        if (args.data.store_name) {
          args.data.store_slug = await generateUniqueSlug('sellerProfile', args.data.store_name)
        }
        return query(args)
      },
      async update({ args, query }: any) {
        if (args.data.store_name && typeof args.data.store_name === 'string') {
          const id = args.where?.id
          args.data.store_slug = await generateUniqueSlug('sellerProfile', args.data.store_name, id)
        }
        return query(args)
      },
    },
  },
})