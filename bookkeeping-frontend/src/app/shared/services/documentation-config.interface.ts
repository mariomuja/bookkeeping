export interface DocumentationFile {
  filename: string;
  title: string;
  path: string;
  category: string;
  order: number;
}

export interface DocumentationConfig {
  /** Base path for documentation files */
  docsBasePath?: string;
  
  /** List of documentation files */
  files: DocumentationFile[];
}


