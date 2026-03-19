type UrlInputCallback = (url: string) => void;

let pendingCallback: UrlInputCallback | null = null;
let pendingLabel: string = '';
const listeners: ((label: string) => void)[] = [];

export function requestUrlInput(label: string, callback: UrlInputCallback) {
  pendingCallback = callback;
  pendingLabel = label;
  listeners.forEach((l) => l(label));
}

export function resolveUrlInput(url: string) {
  if (pendingCallback) {
    pendingCallback(url);
    pendingCallback = null;
    pendingLabel = '';
  }
}

export function cancelUrlInput() {
  pendingCallback = null;
  pendingLabel = '';
}

export function onUrlInputRequest(listener: (label: string) => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getPendingLabel(): string {
  return pendingLabel;
}
