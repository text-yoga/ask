import {
  CompletionMessage,
  IAbortCompletionMessage,
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
export type Meta = {
  tokensSec: number;
  totalTime: number;
  token: string;
};

export type UseAskResponse = {
  questionValue: string;
  onQuestionChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onQuestionSubmit: (props?: AskProps) => React.EventHandler<FormEvent>;
  answerValue: string;
  isLoading: boolean;
  message: string;
  meta: Meta;
};

export const useAsk = (props: UseAskProps): UseAskResponse => {
  const [answerValue, setAnswer] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isAborting, setAborting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [meta, setMeta] = useState<Meta>({
    token: "",
    tokensSec: 0,
    totalTime: 0,
  });
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

  const [questionValue, setQuestionValue] = useState("");

  const onQuestionSubmit = (input?: AskProps) => (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) {
      worker?.postMessage({
        type: "abort",
      } satisfies IAbortCompletionMessage);
    } else {
      if (questionValue == "") return;
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
        prompt: questionValue,
      };
      worker?.postMessage(message);
    }
  };

  const handleMessage = (event: MessageEvent<CompletionMessage>) => {
    if (event.data.type == "generating") {
      const { message, prompt, sentence, tokensSec, totalTime, token } =
        event.data;
      console.log(`Received message from worker`);
      setMessage(message);
      if (!isLoading && !isAborting) setLoading(true);
      if (sentence) {
        setAnswer(sentence);
        setMeta({ tokensSec, totalTime, token: token ?? "" });
      }
    } else if (event.data.type == "loading") {
      if (!isAborting) setLoading(true);
      setMessage(event.data.message);
    } else if (
      event.data.type == "done" ||
      event.data.type == "aborted" ||
      event.data.type == "error"
    ) {
      setLoading(false);
      setAborting(false);
      setMessage(event.data.message);
    } else {
      setLoading(false);
    }
  };

  const onQuestionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setQuestionValue(event.target.value);
  };
  return {
    questionValue,
    onQuestionChange,
    onQuestionSubmit,
    answerValue,
    meta,
    isLoading,
    message,
  };
};
