// aiWorker.ts
// Example Web Worker for offloading AI reply generation or heavy computation

self.onmessage = async (event) => {
  const { type, payload } = event.data;
  if (type === 'generateAIReply') {
    // Simulate heavy AI computation (replace with real logic or API call)
    const result = await fakeAIReply(payload.prompt);
    self.postMessage({ type: 'aiReply', result });
  }
};

async function fakeAIReply(prompt: string): Promise<string> {
  // Simulate delay
  await new Promise((res) => setTimeout(res, 1000));
  return `AI reply to: ${prompt}`;
} 