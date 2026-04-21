const logicalParentRoutes: Record<string, string> = {
  '/': '/products',
  '/auth': '/',
  '/forgot-password': '/auth',
  '/reset-password': '/auth',
  '/cart': '/products',
  '/payment': '/cart',
  '/tracking': '/products',
  '/confirmation': '/products',
  '/orders': '/products',
  '/profile': '/products',
  '/settings': '/products',
  '/addresses': '/products',
  '/payment-methods': '/products',
  '/help': '/products',
  '/notifications': '/products',
  '/privacy': '/products',
  '/terms': '/products',
  '/operator': '/products',
  '/admin': '/products',
  '/admin/products': '/admin',
  '/admin/operators': '/admin',
  '/admin/profiles': '/admin',
  '/admin/orders': '/admin',
  '/admin/promotions': '/admin',
  '/admin/reports': '/admin',
  '/admin/settings': '/admin',
  '/admin/stores': '/admin',
};

export function getBackRoute(pathname: string): string | null {
  if (pathname.startsWith('/orders/')) {
    return '/orders';
  }

  if (pathname.startsWith('/admin/') && pathname !== '/admin') {
    return logicalParentRoutes[pathname] ?? '/admin';
  }

  return logicalParentRoutes[pathname] ?? null;
}