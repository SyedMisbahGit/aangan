import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function runAIWorker(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    // @ts-expect-error: Web Worker import for AI worker
    const worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      if (event.data.type === 'aiReply') {
        resolve(event.data.result);
        worker.terminate();
      }
    };
    worker.postMessage({ type: 'generateAIReply', payload: { prompt } });
  });
}
