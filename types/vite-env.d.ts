/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add support for CSS URL imports
declare module "*.css?url" {
  const url: string;
  export default url;
}
