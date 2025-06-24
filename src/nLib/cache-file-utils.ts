import fs from 'fs/promises';
import path from 'path';

export interface CacheEntry {
  code: string;
  timestamp: number;
}

export type CacheData = Map<string, CacheEntry>;

const CACHE_FILE_NAME = 'cache.json';

class CacheFileService {
  static cacheFilePath = path.join(process.cwd(), CACHE_FILE_NAME);

  /**
   * Reads the cache.json file and returns its content as a Map.
   * Handles file not existing by returning an empty Map.
   * @returns A Promise resolving to the CacheData Map.
   */
  async readCache(): Promise<CacheData> {
    try {
      await fs.access(CacheFileService.cacheFilePath); // Check if file exists
      const fileContent = await fs.readFile(CacheFileService.cacheFilePath, 'utf-8');
      if (!fileContent.trim()) {
        return new Map<string, CacheEntry>();
      }
      const parsedObject = JSON.parse(fileContent);
      if (Array.isArray(parsedObject)) {
        return new Map<string, CacheEntry>(parsedObject);
      } else if (typeof parsedObject === 'object' && parsedObject !== null) {
        return new Map<string, CacheEntry>(Object.entries(parsedObject));
      }
      console.warn('Cache file content was not a valid array of entries or object. Starting with an empty cache.');
      return new Map<string, CacheEntry>();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT') {
        return new Map<string, CacheEntry>();
      }
      console.error('Failed to read cache file:', error);
      return new Map<string, CacheEntry>();
    }
  }

  /**
   * Writes the current cache Map to cache.json.
   * @param cache The CacheData Map to write.
   * @returns A Promise that resolves when the write operation is complete.
   */
  async writeCache(cache: CacheData): Promise<void> {
    try {
      const dataToWrite = JSON.stringify(Array.from(cache.entries()), null, 2);
      await fs.writeFile(CacheFileService.cacheFilePath, dataToWrite, 'utf-8');
    } catch (error) {
      console.error('Failed to write cache file:', error);
    }
  }

  /**
   * Clears the cache file by writing an empty map to it.
   * @returns A Promise that resolves when the clear operation is complete.
   */
  async clearCacheFile(): Promise<void> {
    try {
      const emptyCache = new Map<string, CacheEntry>();
      const dataToWrite = JSON.stringify(Array.from(emptyCache.entries()), null, 2);
      await fs.writeFile(CacheFileService.cacheFilePath, dataToWrite, 'utf-8');
    } catch (error) {
      console.error('Failed to clear cache file:', error);
    }
  }
}

export default CacheFileService;
