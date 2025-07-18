// Version management for cache busting
export const APP_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 
                           process.env.VERCEL_GIT_COMMIT_SHA || 
                           Date.now().toString()

export const CACHE_VERSION = `v${APP_VERSION.slice(0, 8)}`

// Get versioned cache name
export function getVersionedCacheName(baseName: string): string {
  return `${baseName}-${CACHE_VERSION}`
}

// Check if cache version is outdated
export function isCacheOutdated(cacheName: string): boolean {
  return !cacheName.includes(CACHE_VERSION)
}