// import init, { Model } from "@text-yoga/ask";
import { Model, default as init } from "@text-yoga/llama";

export async function fetchArrayBuffer(url: string) {
  const cacheName = "llama2c-candle-cache";
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    const data = await cachedResponse.arrayBuffer();
    return new Uint8Array(data);
  }
  const res = await fetch(url, { cache: "force-cache" });
  cache.put(url, res.clone());
  return new Uint8Array(await res.arrayBuffer());
}
export class Llama2C {
  static instance: Record<string, Model> = {};

  static async getInstance(
    weightsURL: string,
    modelID: string,
    tokenizerURL: string,
  ) {
    // load individual modelID only once
    if (!this.instance[modelID]) {
      await init();

      self.postMessage({ status: "loading", message: "Loading Model" });

      const [weightsArrayU8, tokenizerArrayU8] = await Promise.all([
        fetchArrayBuffer(weightsURL),
        fetchArrayBuffer(tokenizerURL),
      ]);

      this.instance[modelID] = new Model(weightsArrayU8, tokenizerArrayU8);
    }
    return this.instance[modelID];
  }
}

let controller: AbortController | null = null;
self.addEventListener("message", (event) => {
  if (event.data.command === "start") {
    console.log(`Received message in worker`);
    controller = new AbortController();
    generate(event.data);
  } else if (event.data.command === "abort") {
    controller?.abort();
  }
});

export type GenerationProps = {
  weightsURL: string;
  modelID: string;
  tokenizerURL: string;
  prompt: string;
  temp: number;
  top_p: number;
  repeatPenalty: number;
  seed: bigint;
  maxSeqLen: number;
};

export async function generate(data: GenerationProps) {
  const {
    weightsURL,
    modelID,
    tokenizerURL,
    prompt,
    temp,
    top_p,
    repeatPenalty,
    seed,
    maxSeqLen,
  } = data;
  try {
    self.postMessage({ status: "loading", message: "Starting llama2.c" });
    const model = await Llama2C.getInstance(weightsURL, modelID, tokenizerURL);

    self.postMessage({ status: "loading", message: "Initializing model" });
    const firstToken = model?.init_with_prompt(
      prompt,
      temp,
      top_p,
      repeatPenalty,
      seed,
    );

    const seq_len = model?.get_seq_len() ?? 500;

    let sentence = firstToken;
    let maxTokens = maxSeqLen ? maxSeqLen : seq_len - prompt.length - 1;
    let startTime = performance.now();
    let tokensCount = 0;
    while (tokensCount < maxTokens) {
      await new Promise(async (resolve) => {
        if (controller && controller.signal.aborted) {
          self.postMessage({
            status: "aborted",
            message: "Aborted",
            output: prompt + sentence,
          });
          return;
        }
        const token = await model?.next_token();
        const tokensSec =
          ((tokensCount + 1) / (performance.now() - startTime)) * 1000;

        sentence += token ?? "";
        self.postMessage({
          status: "generating",
          message: "Generating token",
          token: token,
          sentence: sentence,
          totalTime: performance.now() - startTime,
          tokensSec,
          prompt: prompt,
        });
        setTimeout(resolve, 0);
      });
      tokensCount++;
    }
    self.postMessage({
      status: "complete",
      message: "complete",
      output: prompt + sentence,
    });
  } catch (e) {
    self.postMessage({ error: e });
  }
}
