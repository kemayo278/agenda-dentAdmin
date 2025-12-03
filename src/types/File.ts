export interface File {
  name: string;
  path: string;
  type?: string;
  size?: number;
  extension?: string;
  description?: string | null;
}
