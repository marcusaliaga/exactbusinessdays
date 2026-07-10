const CANONICAL_HOST = 'exactbusinessdays.com';

const INDEXABLE_ROUTES = new Set([
  '/about',
  '/add-business-days',
  '/australia/working-days',
  '/business-days-between-dates',
  '/business-days-in-2026',
  '/business-days-in-2027',
  '/canada/business-days',
  '/contact',
  '/holiday-business-days',
  '/holiday-data',
  '/methodology',
  '/privacy',
  '/terms',
  '/uk/working-days',
  '/us/business-days',
  '/us/state-business-days',
  '/working-days-calculator'
]);

function canonicalPath(pathname) {
  if (pathname === '/index.html') return '/';
  if (pathname === '/') return pathname;

  const route = pathname.replace(/\/+$/, '').toLowerCase();
  if (route === '/business-days-calculator') return '/';
  return INDEXABLE_ROUTES.has(route) ? `${route}/` : pathname;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const forwardedProtocol = context.request.headers.get('x-forwarded-proto');
  let shouldRedirect = false;

  if (url.hostname.toLowerCase() === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    shouldRedirect = true;
  }

  if (url.protocol === 'http:' || forwardedProtocol === 'http') {
    url.protocol = 'https:';
    shouldRedirect = true;
  }

  const path = canonicalPath(url.pathname);
  if (path !== url.pathname) {
    url.pathname = path;
    shouldRedirect = true;
  }

  if (shouldRedirect) return Response.redirect(url.toString(), 301);
  return context.next();
}
