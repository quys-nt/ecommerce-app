/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Set to 'true' khi đã tạo bảng profiles + orders trong Supabase (chạy supabase-schema.sql) */
  readonly VITE_SUPABASE_ADMIN_TABLES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
