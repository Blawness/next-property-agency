import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

/**
 * Neon Object Storage on the `trihuni` project. The bucket is `public_read`,
 * so an object's URL is public and `next/image` fetches it directly.
 *
 * The variables are `STORAGE_*` rather than the AWS names `neon env pull`
 * writes, because Vercel reserves `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
 * and `AWS_REGION` for its own runtime.
 */
export const PHOTO_BUCKET = "property-images"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set`)
  return value
}

let client: S3Client | undefined

function s3(): S3Client {
  client ??= new S3Client({
    endpoint: requireEnv("STORAGE_ENDPOINT"),
    region: requireEnv("STORAGE_REGION"),
    credentials: {
      accessKeyId: requireEnv("STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("STORAGE_SECRET_ACCESS_KEY"),
    },
    // Neon serves path-style only (`endpoint/bucket/key`).
    forcePathStyle: true,
  })
  return client
}

export async function putPublicObject(key: string, body: Uint8Array, contentType: string): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: PHOTO_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )
  return `${requireEnv("STORAGE_ENDPOINT")}/${PHOTO_BUCKET}/${key}`
}
