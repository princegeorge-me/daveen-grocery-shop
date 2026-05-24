'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateProductSchema } from '@/validations/product.schema'
import { createProduct, updateProduct, deleteProduct } from '@/actions/product.actions'
import { Loader2, Upload, Trash2, Plus, X } from 'lucide-react'
import { formatPriceRaw } from '@/utils/currency'
import { slugify } from '@/utils/slug'
import type { z } from 'zod'

type FormData = z.infer<typeof CreateProductSchema>

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  sku: string
  weight: number | null
  weightUnit: string
  isActive: boolean
  isFeatured: boolean
  trackInventory: boolean
  images: any[]
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  categoryId: string | null
  inventory: { quantity: number; lowStockThreshold: number }[]
}

interface Props {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tags, setTags] = useState<string[]>(product?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isEdit = !!product

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: product.price / 100,
      compareAtPrice: product.compareAtPrice ? product.compareAtPrice / 100 : undefined,
      sku: product.sku,
      weight: product.weight ?? undefined,
      weightUnit: product.weightUnit as any,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      trackInventory: product.trackInventory,
      metaTitle: product.metaTitle ?? '',
      metaDescription: product.metaDescription ?? '',
      initialStock: product.inventory[0]?.quantity ?? 0,
      lowStockThreshold: product.inventory[0]?.lowStockThreshold ?? 10,
    } : {
      isActive: true,
      isFeatured: false,
      trackInventory: true,
      weightUnit: 'LB',
      initialStock: 0,
      lowStockThreshold: 10,
    },
  })

  const nameValue = watch('name')

  const handleNameBlur = () => {
    if (!isEdit && nameValue) {
      setValue('slug', slugify(nameValue))
    }
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const payload = { ...data, tags }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product!.id, payload)
        : await createProduct(payload)

      if (result.success) {
        router.push('/admin/products')
        router.refresh()
      } else {
        setServerError(result.error ?? 'Failed to save product')
      }
    })
  }

  const handleDelete = async () => {
    if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeleting(true)
    const result = await deleteProduct(product.id)
    if (result.success) {
      router.push('/admin/products')
      router.refresh()
    } else {
      setServerError(result.error ?? 'Delete failed')
      setDeleting(false)
    }
  }

  const fieldClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Basic Information */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Product Name *</label>
            <input {...register('name')} onBlur={handleNameBlur} className={fieldClass} placeholder="e.g. Egusi Seeds (Melon)" />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>URL Slug *</label>
            <input {...register('slug')} className={fieldClass} placeholder="egusi-seeds-melon" />
            {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
          </div>

          <div>
            <label className={labelClass}>SKU *</label>
            <input {...register('sku')} className={fieldClass} placeholder="DAV-EGUSI-1KG" />
            {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea {...register('description')} className={fieldClass} rows={4} placeholder="Describe the product..." />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select {...register('categoryId')} className={fieldClass}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" min="0" className={`${fieldClass} pl-7`} placeholder="0.00" />
            </div>
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Compare-at Price <span className="text-gray-400">(optional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input {...register('compareAtPrice', { valueAsNumber: true })} type="number" step="0.01" min="0" className={`${fieldClass} pl-7`} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Weight</label>
            <div className="flex gap-2">
              <input {...register('weight', { valueAsNumber: true })} type="number" step="0.01" className={`${fieldClass} flex-1`} placeholder="1.0" />
              <select {...register('weightUnit')} className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest">
                <option value="LB">lb</option>
                <option value="KG">kg</option>
                <option value="OZ">oz</option>
                <option value="G">g</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Initial Stock</label>
            <input {...register('initialStock', { valueAsNumber: true })} type="number" min="0" className={fieldClass} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Low Stock Threshold</label>
            <input {...register('lowStockThreshold', { valueAsNumber: true })} type="number" min="0" className={fieldClass} placeholder="10" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input {...register('trackInventory')} type="checkbox" id="trackInventory" className="w-4 h-4 accent-brand-forest" />
            <label htmlFor="trackInventory" className="text-sm text-gray-700">Track inventory</label>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">Tags</h2>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            className={`${fieldClass} flex-1`}
            placeholder="Add a tag and press Enter"
          />
          <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* SEO */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-lg">SEO</h2>
        <div>
          <label className={labelClass}>Meta Title <span className="text-gray-400">(max 60 chars)</span></label>
          <input {...register('metaTitle')} className={fieldClass} maxLength={60} />
        </div>
        <div>
          <label className={labelClass}>Meta Description <span className="text-gray-400">(max 160 chars)</span></label>
          <textarea {...register('metaDescription')} className={fieldClass} rows={2} maxLength={160} />
        </div>
      </section>

      {/* Status */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 text-lg mb-4">Visibility</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-brand-forest" />
            Active (visible in store)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register('isFeatured')} type="checkbox" className="w-4 h-4 accent-brand-forest" />
            Featured (show on homepage)
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Product
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="flex items-center gap-2 px-6 py-2 bg-brand-forest text-white rounded-xl text-sm font-semibold hover:bg-brand-forest/90 disabled:opacity-50 transition"
          >
            {(isSubmitting || isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  )
}
