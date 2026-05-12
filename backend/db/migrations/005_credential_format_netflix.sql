-- Migration 005: tambah format `email_profile_pin` ke whitelist credential_format
-- untuk Netflix profile-sharing (email + nomor profil + PIN).
--
-- Idempotent: drop dulu constraint lama, baru re-create dengan list baru.

alter table public.products
  drop constraint if exists products_credential_format_check;

alter table public.products
  add constraint products_credential_format_check
  check (credential_format in (
    'email_password',
    'email_pin',
    'email_profile_pin',
    'key_only',
    'link_only',
    'cookie',
    'custom'
  ));
