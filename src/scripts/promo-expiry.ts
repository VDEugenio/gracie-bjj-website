/** Removes the promo banner client-side once its expiry date has passed (the build checks too). */
const banner = document.querySelector<HTMLElement>('[data-promo]');
const expires = banner?.dataset.promoExpires;

if (banner && expires) {
  const [year, month, day] = expires.split('-').map(Number);
  if (year && month && day) {
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    if (Date.now() > endOfDay.getTime()) banner.remove();
  }
}
