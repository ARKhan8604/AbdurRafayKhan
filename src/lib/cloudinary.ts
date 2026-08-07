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

/** Produce a signed upload payload the browser can post directly to Cloudinary. */
export function signUpload(folder: string) {
  if (!isCloudinaryConfigured()) throw new Error("Cloudinary is not configured");
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret!);
  return {
    signature,
    timestamp,
    apiKey: apiKey!,
    cloudName: cloudName!,
    folder,
  };
}

export { cloudinary };
