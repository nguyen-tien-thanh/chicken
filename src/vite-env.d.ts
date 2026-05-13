/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;

  readonly VITE_VIETQR_BANK_CODE?: string;
  readonly VITE_VIETQR_ACCOUNT_NUMBER?: string;
  readonly VITE_VIETQR_ACCOUNT_NAME?: string;
}
