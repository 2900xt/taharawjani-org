export function isAdminEnabled(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}

export function requireAdmin() {
  if (!isAdminEnabled()) {
    throw new Error('Admin features are not enabled')
  }
}
