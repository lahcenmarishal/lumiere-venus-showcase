/** The confirmation button marks the end of the mobile purchase flow. */
export function isOrderBarVisible({ mobile, scroll, submitBottom, viewportTop, viewportHeight }: { mobile: boolean; scroll: number; submitBottom: number | null; viewportTop: number; viewportHeight: number }) {
  if (mobile) return submitBottom !== null && submitBottom <= viewportTop + viewportHeight / 3;
  return scroll > 160;
}
