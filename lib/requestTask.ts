import { requestJson } from "./request";

export class RequestTask {
  private controller: AbortController | null = null;
  get pending() { return this.controller !== null; }

  cancel() {
    this.controller?.abort();
    this.controller = null;
  }

  async run(url: string, init: RequestInit = {}, timeoutMs = 30000) {
    this.cancel();
    const controller = new AbortController();
    this.controller = controller;
    try {
      const result = await requestJson(url, { ...init, signal: controller.signal }, timeoutMs);
      if (this.controller !== controller || controller.signal.aborted) {
        throw new DOMException("Request cancelled", "AbortError");
      }
      return result;
    } finally {
      if (this.controller === controller) this.controller = null;
    }
  }
}

// One in-flight checkout per page, shared by all repeated product controls.
const checkoutPages = new Set<string>();
const listeners = new Set<() => void>();
export const subscribeCheckout = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export const checkoutPending = (page: string) => checkoutPages.has(page);
export function acquireCheckout(page: string) {
  if (checkoutPages.has(page)) return null;
  checkoutPages.add(page);
  listeners.forEach((notify) => notify());
  let released = false;
  return () => {
    if (released) return;
    released = true;
    checkoutPages.delete(page);
    listeners.forEach((notify) => notify());
  };
}
