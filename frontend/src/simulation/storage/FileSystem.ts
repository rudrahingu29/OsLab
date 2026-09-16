export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  size: number;
}

export class FileSystem {
  private root: FileNode;

  constructor() {
    this.root = {
      name: '/',
      type: 'directory',
      size: 0,
      children: [
        { name: 'home', type: 'directory', size: 0, children: [{ name: 'user', type: 'directory', size: 0, children: [] }] },
        { name: 'system', type: 'directory', size: 0, children: [] },
        { name: 'apps', type: 'directory', size: 0, children: [] }
      ]
    };
  }

  public getRoot(): FileNode {
    return this.root;
  }
  
  public reset(): void {
    this.root = {
      name: '/',
      type: 'directory',
      size: 0,
      children: [
        { name: 'home', type: 'directory', size: 0, children: [{ name: 'user', type: 'directory', size: 0, children: [] }] },
        { name: 'system', type: 'directory', size: 0, children: [] },
        { name: 'apps', type: 'directory', size: 0, children: [] }
      ]
    };
  }

  private findNode(path: string): FileNode | null {
    const parts = path.split('/').filter(Boolean);
    let current = this.root;
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children) return null;
      const found = current.children.find(c => c.name === part);
      if (!found) return null;
      current = found;
    }
    return current;
  }

  public listDirectory(path: string): FileNode[] {
    const node = this.findNode(path);
    if (node && node.type === 'directory' && node.children) {
      return node.children;
    }
    return [];
  }

  public getFile(path: string): FileNode | null {
    const node = this.findNode(path);
    if (node && node.type === 'file') {
      return node;
    }
    return null;
  }

  public createDirectory(absolutePath: string): void {
    const parts = absolutePath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    const name = parts[parts.length - 1];
    const parentPath = '/' + parts.slice(0, -1).join('/');
    const node = this.findNode(parentPath);
    if (node && node.type === 'directory') {
      if (!node.children) node.children = [];
      if (node.children.some(c => c.name === name)) return;
      node.children.push({
        name,
        type: 'directory',
        size: 0,
        children: []
      });
    }
  }

  public createFile(absolutePath: string, content = ''): void {
    const parts = absolutePath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    const name = parts[parts.length - 1];
    const parentPath = '/' + parts.slice(0, -1).join('/');
    const node = this.findNode(parentPath);
    if (node && node.type === 'directory') {
      if (!node.children) node.children = [];
      const existing = node.children.find(c => c.name === name);
      if (existing) {
        existing.content = content;
        existing.size = content.length;
      } else {
        node.children.push({
          name,
          type: 'file',
          size: content.length,
          content
        });
      }
    }
  }
}
