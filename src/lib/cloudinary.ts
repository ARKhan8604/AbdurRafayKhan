import "server-only";
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

/** Formats the admin panel ever actually uploads (images + PDF résumé). Nothing else is signed. */
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg", "pdf"] as const;
/** 10 MB — generous for a photo or a résumé PDF, small enough to bound abuse. Enforced post-upload (see confirmUpload) since Cloudinary's signed Upload API has no signable byte-size param. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Produce a signed upload payload the browser can post directly to
 * Cloudinary. `allowed_formats` is bound into the signature itself, so
 * Cloudinary rejects any other file type server-side — not just our UI.
 * The dominant defense, though, is that a signature can only ever be
 * obtained by the authenticated admin (see /api/cloudinary/sign): a
 * stranger has no path to Cloudinary's upload endpoint at all.
 */
export function signUpload(folder: string) {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured");
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder,
    allowed_formats: ALLOWED_FORMATS.join(","),
  };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret!);
  return {
    signature,
    timestamp,
    apiKey: apiKey!,
    cloudName: cloudName!,
    folder,
    allowedFormats: params.allowed_formats,
    maxBytes: MAX_UPLOAD_BYTES,
  };
}

/**
 * Cloudinary's signed Upload API has no enforced byte-size limit, so size
 * is checked after the fact: if the asset Cloudinary just accepted is over
 * budget, delete it immediately via the Admin API. A violating file exists
 * for a few hundred ms at most and is never linked from anywhere in the app
 * (the admin form only stores the URL after this check passes).
 */
export async function enforceUploadSize(publicId: string, resourceType: string, bytes: number) {
  if (bytes <= MAX_UPLOAD_BYTES) return true;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "raw" ? "raw" : resourceType === "video" ? "video" : "image",
    });
  } catch (err) {
    console.error("Failed to delete oversized Cloudinary upload:", err);
  }
  return false;
}

export { cloudinary };
