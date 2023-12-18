import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import LlamaWorker from "../../node_modules/@text-yoga/ask/dist/index?worker";

const updateStatus =
  (data: any) => (dispatch: React.Dispatch<React.SetStateAction<string>>) => {
    switch (data.status) {
      case "loading":
        console.log("Loading");
        break;
      case "generating":
        const { message, prompt, sentence, tokensSec, totalTime } = data;
        console.log(`Generating ${sentence}`);
        dispatch(sentence);
        break;
      case "complete":
        console.log(`Done`);
        break;
    }
  };

export default function Index() {
  const fetcher = useFetcher();
  const [state, setState] = useState<Worker | null>(null);
  const [text, setText] = useState<string>("hello world");
  useEffect(() => {
    console.log(`Creating worker`);
    const llamaWorker = new LlamaWorker();
    console.log(`Finished creating worker`);
    const handleMessage = (event: any) => {
      const { status, error, message, prompt, sentence } = event.data;
      console.log(`Received message from worker`);
      if (status) updateStatus(event.data)(setText);
      if (error) {
        llamaWorker.removeEventListener("message", handleMessage);
        // reject(new Error(error));
      }
      if (status === "aborted") {
        llamaWorker.removeEventListener("message", handleMessage);
        // resolve(event.data);
      }
      if (status === "complete") {
        llamaWorker.removeEventListener("message", handleMessage);
        // resolve(event.data);
      }
    };
    llamaWorker.addEventListener("message", handleMessage);
    llamaWorker.postMessage({
      weightsURL: `http://localhost:5173/model.bin`,
      modelID: "stories15M",
      tokenizerURL: `http://localhost:5173/tokenizer.json`,
      prompt: "What are basic steps in brewing beer?",
      temp: 0.4,
      top_p: 1,
      repeatPenalty: 1.1,
      seed: BigInt(299792458),
      maxSeqLen: 50,
      command: "start",
    });
    setState(llamaWorker);
  }, []);
  return (
    <div>
      <h1>Test</h1>
      <div>{text}</div>
      {/* <fetcher.Form method="post">
        <input
          name="question"
          type="text"
          placeholder="Ask me anything about"
        />
        <button type="submit">Ask</button>
      </fetcher.Form> */}
      <button
        onClick={() => {
          state?.postMessage({
            weightsURL: `http://localhost:5173/model.bin`,
            modelID: "stories15M",
            tokenizerURL: `http://localhost:5173/tokenizer.json`,
            prompt: "Hello world",
            temp: 0.4,
            top_p: 1,
            repeatPenalty: 1.1,
            seed: BigInt(299792458),
            maxSeqLen: 50,
            command: "start",
          });
        }}
      >
        Run
      </button>
    </div>
  );
}
