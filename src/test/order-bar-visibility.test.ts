import { describe, expect, it } from 'vitest';
import { isOrderBarVisible } from '../lib/order-bar-visibility';

describe('floating order shortcut', () => {
  const mobile = { mobile: true, scroll: 0, viewportTop: 0, viewportHeight: 494 };
  it('appears as soon as confirmation passes the upper third, without waiting for the notes', () => {
    expect(isOrderBarVisible({ ...mobile, submitBottom: 165 })).toBe(false);
    expect(isOrderBarVisible({ ...mobile, submitBottom: 164 })).toBe(true);
  });
  it('uses the visual viewport offset and hides on returning to the form', () => {
    expect(isOrderBarVisible({ ...mobile, viewportTop: 20, submitBottom: 184 })).toBe(true);
    expect(isOrderBarVisible({ ...mobile, viewportTop: 20, submitBottom: 185 })).toBe(false);
    expect(isOrderBarVisible({ ...mobile, submitBottom: null })).toBe(false);
  });
  it('keeps the desktop 160px scroll threshold', () => {
    expect(isOrderBarVisible({ ...mobile, mobile: false, scroll: 160, submitBottom: null })).toBe(false);
    expect(isOrderBarVisible({ ...mobile, mobile: false, scroll: 161, submitBottom: null })).toBe(true);
  });
});
