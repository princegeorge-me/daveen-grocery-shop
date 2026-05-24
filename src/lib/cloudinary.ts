import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export { cloudinary }

export async function uploadProductImage(
  file: Buffer | string,
  productSlug: string,
  position = 0
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(
    typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder:         `daveen-grocery/products/${productSlug}`,
      public_id:      `${productSlug}-${position}`,
      overwrite:      true,
      transformation: [
        { width: 800, height: 800, crop: 'fill', gravity: 'auto' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    }
  )
  return { url: result.secure_url, publicId: result.public_id }
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
