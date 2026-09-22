export class RequestTimeoutError extends Error {
  constructor() {
    super("This is taking longer than expected. Please try again.");
    this.name = "RequestTimeoutError";
  }
}

// Covers both response headers and JSON. Abort/timeout settles even if an
// underlying transport ignores cancellation; late results cannot be applied.
export async function requestJson(
  url: string,
  init: RequestInit = {},
  timeoutMs = 30000,
) {
  const controller = new AbortController();
  const parent = init.signal;
  let timer: ReturnType<typeof setTimeout>;
  let abort: () => void = () => {};
  const interrupted = new Promise<never>((_, reject) => {
    abort = () => {
      controller.abort();
      reject(new DOMException("Request cancelled", "AbortError"));
    };
    timer = setTimeout(() => {
      controller.abort();
      reject(new RequestTimeoutError());
    }, timeoutMs);
    if (parent?.aborted) abort();
    else parent?.addEventListener("abort", abort, { once: true });
  });
  try {
    return await Promise.race([
      interrupted,
      (async () => {
        const response = await fetch(url, { ...init, signal: controller.signal });
        const data = await response.json().catch(() => null);
        return { response, data };
      })(),
    ]);
  } finally {
    clearTimeout(timer!);
    parent?.removeEventListener("abort", abort);
  }
}

export function isRequestCancelled(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
