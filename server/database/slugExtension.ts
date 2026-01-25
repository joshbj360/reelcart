import { Prisma } from '../../prisma/generated/client'
import { generateUniqueSlug } from '../utils/slugify'

export const slugExtension = Prisma.defineExtension({
  name: 'slugExtension',
  model: {
    products: {
      async create({ args, query }: any) {
        try {
          if (args?.data?.title && query && typeof query === 'function') {
            args.data.slug = await generateUniqueSlug('products', args.data.title)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
      async update({ args, query }: any) {
        try {
          if (args?.data?.title && typeof args.data.title === 'string' && query && typeof query === 'function') {
            args.data.slug = await generateUniqueSlug('products', args.data.title, args.where?.id)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
    },
    category: {
      async create({ args, query }: any) {
        try {
          if (args?.data?.name && query && typeof query === 'function') {
            args.data.slug = await generateUniqueSlug('category', args.data.name)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
      async update({ args, query }: any) {
        try {
          if (args?.data?.name && typeof args.data.name === 'string' && query && typeof query === 'function') {
            args.data.slug = await generateUniqueSlug('category', args.data.name, args.where?.id)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
    },
    sellerProfile: {
      async create({ args, query }: any) {
        try {
          if (args?.data?.store_name && query && typeof query === 'function') {
            args.data.store_slug = await generateUniqueSlug('sellerProfile', args.data.store_name)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
      async update({ args, query }: any) {
        try {
          if (args?.data?.store_name && typeof args.data.store_name === 'string' && query && typeof query === 'function') {
            args.data.store_slug = await generateUniqueSlug('sellerProfile', args.data.store_name, args.where?.id)
          }
          return query ? query(args) : args
        } catch (error) {
          console.warn('⚠️ Slug generation failed:', error)
          return query ? query(args) : args
        }
      },
    },
  },
})