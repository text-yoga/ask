import {
  CompletionMessage,
  IGenerateCompletionMessage,
} from "@text-yoga/ask/dist/types.js";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

export type UseAskProps = {
  ask: new () => Worker;
};

export type AskProps = {
  temp?: number;
  top_p?: number;
  repeatPenalty?: number;
  seed?: bigint;
  maxSeqLen?: number;
};
export type UseAskResponse = {
  question: string;
  handleQuestionChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  handleAsk: (props?: AskProps) => React.FormEventHandler;
  answer: string;
};

export const useAsk = (props: UseAskProps): UseAskResponse => {
  const [answer, setAnswer] = useState<string>("");
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const askWorker: Worker = new props.ask();
    console.log(`Initialised worker`, askWorker);
    askWorker.addEventListener("message", handleMessage);

    setWorker(askWorker);
    return () => {
      askWorker.removeEventListener("message", handleMessage);
      askWorker.terminate();
    };
  }, []);

  const weightsURL = `http://localhost:5173/model.bin`;
  const modelID = "stories15M";
  const tokenizerURL = `http://localhost:5173/tokenizer.json`;

  const [question, setQuestion] = useState("");

  const handleAsk = useCallback(
    (input?: AskProps) => (event: FormEvent) => {
      event.preventDefault();
      if (question == "") return;
      const message: IGenerateCompletionMessage = {
        type: "generate",
        modelID,
        tokenizerURL,
        weightsURL,
        temp: input?.temp ?? 0.4,
        top_p: input?.top_p ?? 1,
        repeatPenalty: input?.repeatPenalty ?? 1.1,
        seed:
          input?.seed ??
          BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
        maxSeqLen: input?.maxSeqLen ?? 50,
        prompt: question,
      };
      worker?.postMessage(message);
    },
    [worker],
  );

  const handleMessage = (event: MessageEvent<CompletionMessage>) => {
    if (event.data.type == "generating") {
      const { message, prompt, sentence } = event.data;
      console.log(`Received message from worker`);
      if (sentence) setAnswer(sentence);
    }
  };

  const handleQuestionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setQuestion(event.target.value);
  };
  return {
    question,
    handleQuestionChange,
    handleAsk,
    answer,
  };
};
