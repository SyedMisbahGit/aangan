// Utility to determine if a route is user-facing
export function isUserFacingRoute(pathname: string) {
  // Add or remove routes as needed
  const nonUserFacing = [
    '/admin', '/admin/', '/admin/dashboard', '/admin/reports', '/admin/bans', 
    '/admin/whispers', '/admin/users', '/admin/ai-jobs', '/admin/settings',
    '/login', '/notfound', '/404', '/500', '/error', '/adminlogin', '/admininsights'
  ];
  return !nonUserFacing.some(route => pathname.startsWith(route));
}
