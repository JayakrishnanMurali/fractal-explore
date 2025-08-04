export interface ComponentInfo {
  name: string;
  filePath: string;
  props: ComponentProp[];
  docstring?: string;
  examples?: ComponentExample[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  description?: string;
}

export interface ProjectConfig {
  name: string;
  rootPath: string;
  framework: 'react' | 'next' | 'vite';
  componentsPath: string[];
  exclude?: string[];
}

export interface ScanResult {
  components: ComponentInfo[];
  projectConfig: ProjectConfig;
  timestamp: number;
}