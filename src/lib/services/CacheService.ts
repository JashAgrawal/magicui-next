import fs from 'fs/promises';
import path from 'path';

export interface CacheEntry {
  code: string;
  timestamp: number;
}

export type CacheData = Map<string, CacheEntry>;

const CACHE_FILE_NAME = 'magicui-cache.json'; // Renamed for clarity
const DEFAULT_CACHE_DIR = '.magicui_cache'; // Default cache directory

export class CacheService {
  private cacheFilePath: string;

  constructor(cacheDir?: string) {
    const dir = cacheDir || path.join(process.cwd(), DEFAULT_CACHE_DIR);
    this.cacheFilePath = path.join(dir, CACHE_FILE_NAME);
    this.ensureCacheDirExists(dir);
  }

  private async ensureCacheDirExists(cacheDir: string): Promise<void> {
    try {
      await fs.mkdir(cacheDir, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists, otherwise log error
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code !== 'EEXIST') {
        console.error(`Failed to create cache directory at ${cacheDir}:`, error);
      }
    }
  }

  public async readCache(): Promise<CacheData> {
    try {
      await fs.access(this.cacheFilePath);
      const fileContent = await fs.readFile(this.cacheFilePath, 'utf-8');
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

  public async writeCache(cache: CacheData): Promise<void> {
    try {
      const dataToWrite = JSON.stringify(Array.from(cache.entries()), null, 2);
      await fs.writeFile(this.cacheFilePath, dataToWrite, 'utf-8');
    } catch (error) {
      console.error('Failed to write cache file:', error);
    }
  }

  public async clearCacheFile(): Promise<void> {
    try {
      const emptyCache = new Map<string, CacheEntry>();
      await this.writeCache(emptyCache);
    } catch (error) {
      console.error('Failed to clear cache file:', error);
    }
  }

  public getCacheFilePath(): string {
    return this.cacheFilePath;
  }
}
