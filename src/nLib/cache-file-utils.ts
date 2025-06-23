import fs from 'fs/promises';
import path from 'path';

export interface CacheEntry {
  code: string;
  timestamp: number;
}

export type CacheData = Map<string, CacheEntry>;

const CACHE_FILE_NAME = 'cache.json';
// Define cacheFilePath relative to the project root.
// This assumes the service running this code (e.g., Next.js server)
// has its current working directory at the project root.
const cacheFilePath = path.join(process.cwd(), CACHE_FILE_NAME);

/**
 * Reads the cache.json file and returns its content as a Map.
 * Handles file not existing by returning an empty Map.
 * @returns A Promise resolving to the CacheData Map.
 */
export async function readCache(): Promise<CacheData> {
  try {
    await fs.access(cacheFilePath); // Check if file exists
    const fileContent = await fs.readFile(cacheFilePath, 'utf-8');
    if (!fileContent.trim()) {
      return new Map<string, CacheEntry>();
    }
    // JSON.parse cannot directly revive a Map, so parse to an object or array of entries
    const parsedObject = JSON.parse(fileContent);
    // Assuming the JSON structure is an object like { key1: entry1, key2: entry2 }
    // or an array of [key, value] entries, e.g., from Map previously stringified with Array.from()
    if (Array.isArray(parsedObject)) {
      return new Map<string, CacheEntry>(parsedObject);
    } else if (typeof parsedObject === 'object' && parsedObject !== null) {
      return new Map<string, CacheEntry>(Object.entries(parsedObject));
    }
    console.warn('Cache file content was not a valid array of entries or object. Starting with an empty cache.');
    return new Map<string, CacheEntry>();
  } catch (error: unknown) {
    // If error is ENOENT (file not found), it's not a critical error, just means no cache yet.
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
      // console.log('Cache file not found. Starting with an empty cache.');
      return new Map<string, CacheEntry>();
    }
    // For other errors, log them as it might indicate a problem.
    console.error('Failed to read cache file:', error);
    return new Map<string, CacheEntry>();
  }
}

/**
 * Writes the current cache Map to cache.json.
 * @param cache The CacheData Map to write.
 * @returns A Promise that resolves when the write operation is complete.
 */
export async function writeCache(cache: CacheData): Promise<void> {
  try {
    // Convert Map to an array of [key, value] entries for JSON stringification,
    // as JSON doesn't directly support Maps.
    const dataToWrite = JSON.stringify(Array.from(cache.entries()), null, 2);
    await fs.writeFile(cacheFilePath, dataToWrite, 'utf-8');
  } catch (error) {
    console.error('Failed to write cache file:', error);
    // Depending on policy, you might want to throw the error or handle it
  }
}

/**
 * Clears the cache file by writing an empty map to it.
 * @returns A Promise that resolves when the clear operation is complete.
 */
export async function clearCacheFile(): Promise<void> {
  try {
    const emptyCache = new Map<string, CacheEntry>();
    const dataToWrite = JSON.stringify(Array.from(emptyCache.entries()), null, 2);
    await fs.writeFile(cacheFilePath, dataToWrite, 'utf-8');
    // console.log('Cache file cleared.');
  } catch (error) {
    console.error('Failed to clear cache file:', error);
  }
}
