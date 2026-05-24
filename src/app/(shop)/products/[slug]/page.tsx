import type { Metadata }  from 'next'
import { notFound }        from 'next/navigation'
import Image               from 'next/image'
import Link                from 'next/link'
import { Star, Truck, Clock, Shield } from 'lucide-react'
import { ProductService }  from '@/services/product.service'
import PriceDisplay        from '@/components/shared/PriceDisplay'
import ProductGrid         from '@/components/product/ProductGrid'
import AddToCartButton     from '@/components/product/AddToCartButton'
import { siteConfig }      from '@/config/site'

export const revalidate = 120

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product  = await ProductService.getBySlug(slug)
  if (!product)  return { title: 'Product Not Found' }

  const images = Array.isArray(product.images) ? product.images as { url: string }[] : []

  return {
    title:       product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title:       product.name,
      description: product.shortDescription ?? '',
      images:      images[0] ? [images[0].url] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product  = await ProductService.getBySlug(slug)
  if (!product)  notFound()

  const images    = Array.isArray(product.images) ? product.images as { url: string; alt: string }[] : []
  const mainImage = images[0]?.url ?? '/placeholder.jpg'
  const inStock   = product.inventory
    ? product.inventory.quantity - product.inventory.reservedQuantity > 0
    : true
  const isLow     = product.inventory
    ? product.inventory.quantity - product.inventory.reservedQuantity <= product.inventory.lowStockThreshold
    : false

  const related = await ProductService.getRelated(product.id, product.categoryId)

  // JSON-LD structured data
  const jsonLd = {
    '@context':     'https://schema.org',
    '@type':        'Product',
    name:           product.name,
    description:    product.description ?? '',
    image:          images.map(i => i.url),
    sku:            product.sku ?? undefined,
    offers: {
      '@type':       'Offer',
      url:           `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: 'USD',
      price:         (product.price / 100).toFixed(2),
      availability:  inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller:        { '@type': 'Organization', name: siteConfig.name },
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type':       'AggregateRating',
        ratingValue:   product.avgRating.toFixed(1),
        reviewCount:   product.reviewCount,
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-shop py-6">
        {/* Breadcrumb */}
        <nav className="flex gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/"          className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products"  className="hover:text-foreground">Products</Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30">
              <Image src={mainImage} alt={images[0]?.alt ?? product.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border cursor-pointer hover:border-brand-forest transition-colors">
                    <Image src={img.url} alt={img.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div>
            <p className="text-sm text-brand-forest font-semibold uppercase tracking-wide mb-2">
              {product.category.name}
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.avgRating) ? 'fill-brand-gold text-brand-gold' : 'text-muted-foreground'} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            )}

            <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="xl" className="mb-4" />

            {/* Stock status */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-6 ${inStock ? isLow ? 'bg-orange-50 text-orange-600' : 'bg-brand-forest-light text-brand-forest' : 'bg-destructive/10 text-destructive'}`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? isLow ? 'bg-orange-500' : 'bg-brand-forest' : 'bg-destructive'}`} />
              {inStock ? isLow ? `Only ${product.inventory?.quantity ?? '?'} left in stock` : 'In Stock' : 'Out of Stock'}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-sm mb-2">Size / Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} className="px-4 py-2 rounded-xl border-2 border-border text-sm font-medium hover:border-brand-forest transition-colors">
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="space-y-3 mb-6">
              <AddToCartButton productId={product.id} inStock={inStock} />
            </div>

            {/* Delivery info */}
            <div className="bg-brand-forest-pale rounded-2xl p-4 space-y-3">
              <div className="flex gap-3 items-start">
                <Truck size={18} className="text-brand-forest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Free delivery over $50</p>
                  <p className="text-xs text-muted-foreground">Delivery available to select Chicago ZIP codes</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Clock size={18} className="text-brand-forest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Order by 2:00 PM for same-day delivery</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Shield size={18} className="text-brand-forest mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Secure checkout via Stripe</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h2 className="font-semibold mb-2">About this product</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">You Might Also Like</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  )
}
