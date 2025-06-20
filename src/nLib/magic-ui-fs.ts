import { v4 as uuidv4 } from 'uuid';

// Types
type FileType = 'file' | 'directory' | 'component' | 'asset';

interface BaseEntry {
  id: string;
  name: string;
  type: FileType;
  parent: DirectoryEntry | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface FileEntry extends BaseEntry {
  type: 'file' | 'component' | 'asset';
  content: string | ArrayBuffer;
  mimeType?: string;
}

export interface DirectoryEntry extends BaseEntry {
  type: 'directory';
  children: Map<string, FileEntry | DirectoryEntry>;
}

export interface FileSystem {
  readFile(path: string): Promise<FileEntry | null>;
  writeFile(path: string, content: string | ArrayBuffer, options?: { type?: string; mimeType?: string }): Promise<FileEntry>;
  deleteFile(path: string): Promise<boolean>;
  createDirectory(path: string): Promise<DirectoryEntry>;
  readDirectory(path: string): Promise<Array<FileEntry | DirectoryEntry>>;
  exists(path: string): Promise<boolean>;
  getFileInfo(path: string): Promise<FileEntry | DirectoryEntry | null>;
  move(source: string, destination: string): Promise<boolean>;
  copy(source: string, destination: string): Promise<boolean>;
}

/**
 * MagicUIFileSystem implements a virtual file system for managing UI components and assets
 */
class MagicUIFileSystem implements FileSystem {
  private root: DirectoryEntry = {
    id: 'root',
    name: 'root',
    type: 'directory',
    children: new Map(),
    parent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Normalize path to handle different formats
   */
  private normalizePath(path: string): string[] {
    return path.split(/[\\/]+/).filter(Boolean);
  }

  /**
   * Resolve a path to an entry
   */
  private resolvePath(path: string): { entry: FileEntry | DirectoryEntry | null; name: string; parent: DirectoryEntry | null } {
    const parts = this.normalizePath(path);
    if (parts.length === 0) {
      return { entry: this.root, name: '', parent: null };
    }

    let current: FileEntry | DirectoryEntry = this.root;
    const name = parts.pop()!;

    for (const part of parts) {
      if (current.type !== 'directory') {
        return { entry: null, name, parent: null };
      }
      const child = current.children.get(part);
      if (!child) {
        return { entry: null, name, parent: null };
      }
      current = child;
    }

    return {
      entry: current.type === 'directory' ? current.children.get(name) || null : null,
      name,
      parent: current.type === 'directory' ? current : null,
    };
  }

  async readFile(path: string): Promise<FileEntry | null> {
    const { entry } = this.resolvePath(path);
    return entry?.type !== 'directory' ? (entry as FileEntry) : null;
  }

  async writeFile(
    path: string,
    content: string | ArrayBuffer,
    options: { type?: string; mimeType?: string } = {}
  ): Promise<FileEntry> {
    const { name, parent } = this.resolvePath(path);
    
    if (!parent) {
      throw new Error('Invalid path or parent directory does not exist');
    }

    const now = new Date();
    const fileType = (options.type as FileType) || 'file';
    
    const file: FileEntry = {
      id: uuidv4(),
      name,
      type: fileType,
      content,
      mimeType: options.mimeType || this.getMimeType(name, content),
      parent,
      createdAt: now,
      updatedAt: now,
    };

    parent.children.set(name, file);
    return file;
  }

  async deleteFile(path: string): Promise<boolean> {
    const { entry, name, parent } = this.resolvePath(path);
    
    if (!entry || !parent || entry.type === 'directory') {
      return false;
    }

    return parent.children.delete(name);
  }

  async createDirectory(path: string): Promise<DirectoryEntry> {
    const { entry, name, parent } = this.resolvePath(path);
    
    if (entry) {
      if (entry.type === 'directory') {
        return entry;
      }
      throw new Error('A file with the same name already exists');
    }

    if (!parent) {
      throw new Error('Parent directory does not exist');
    }

    const now = new Date();
    const dir: DirectoryEntry = {
      id: uuidv4(),
      name,
      type: 'directory',
      children: new Map(),
      parent,
      createdAt: now,
      updatedAt: now,
    };

    parent.children.set(name, dir);
    return dir;
  }

  async readDirectory(path: string): Promise<Array<FileEntry | DirectoryEntry>> {
    const { entry } = this.resolvePath(path);
    
    if (!entry || entry.type !== 'directory') {
      throw new Error('Directory not found');
    }

    return Array.from(entry.children.values());
  }

  async exists(path: string): Promise<boolean> {
    const { entry } = this.resolvePath(path);
    return entry !== null;
  }

  async getFileInfo(path: string): Promise<FileEntry | DirectoryEntry | null> {
    const { entry } = this.resolvePath(path);
    return entry;
  }

  async move(source: string, destination: string): Promise<boolean> {
    const sourceInfo = this.resolvePath(source);
    const destInfo = this.resolvePath(destination);

    if (!sourceInfo.entry || !sourceInfo.parent || !destInfo.parent) {
      return false;
    }

    // Copy the entry
    const entry = sourceInfo.entry;
    
    // Remove from old parent
    sourceInfo.parent.children.delete(sourceInfo.name);
    
    // Update parent and name
    (entry as any).parent = destInfo.parent;
    (entry as any).name = destInfo.name;
    (entry as any).updatedAt = new Date();
    
    // Add to new parent
    destInfo.parent.children.set(destInfo.name, entry);
    
    return true;
  }

  
  async copy(source: string, destination: string): Promise<boolean> {
    const sourceInfo = this.resolvePath(source);
    const destInfo = this.resolvePath(destination);

    if (!sourceInfo.entry || !destInfo.parent) {
      return false;
    }

    // Deep clone the entry
    const entry = JSON.parse(JSON.stringify(sourceInfo.entry));
    entry.id = uuidv4();
    entry.name = destInfo.name;
    entry.parent = destInfo.parent;
    entry.createdAt = new Date();
    entry.updatedAt = new Date();

    // Add to new parent
    destInfo.parent.children.set(destInfo.name, entry);
    
    return true;
  }

  private getMimeType(filename: string, content: string | ArrayBuffer): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: Record<string, string> = {
      // Text
      'txt': 'text/plain',
      'md': 'text/markdown',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'json': 'application/json',
      'xml': 'application/xml',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      
      // Fonts
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'otf': 'font/otf',
      
      // Media
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const magicUIFileSystem = new MagicUIFileSystem();
