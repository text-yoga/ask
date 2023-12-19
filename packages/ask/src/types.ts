export type ICompletionMessageType =
  | "loading"
  | "generating"
  | "generate"
  | "abort"
  | "aborted"
  | "done"
  | "error";
export interface ICompletionMessage {
  type: ICompletionMessageType;
}

export interface ILoadingCompletionMessage extends ICompletionMessage {
  type: "loading";
  message: string;
}

export type ModelProps = {
  weightsURL: string;
  modelID: string;
  tokenizerURL: string;
};
export type GenerationInput = {
  prompt: string;
  temp: number;
  top_p: number;
  repeatPenalty: number;
  seed: bigint;
  maxSeqLen: number;
};

export type GenerationProps = ModelProps & GenerationInput;
export interface IGenerateCompletionMessage
  extends ICompletionMessage,
    GenerationProps {
  type: "generate";
}

export type GeneratingProps = {
  message: string;
  token?: string;
  sentence?: string;
  totalTime: number;
  tokensSec: number;
  prompt: string;
};
export interface IGeneratingCompletionMessage
  extends ICompletionMessage,
    GeneratingProps {
  type: "generating";
}
export interface IAbortCompletionMessage extends ICompletionMessage {
  type: "abort";
}
export interface IAbortedCompletionMessage extends ICompletionMessage {
  type: "aborted";
  message: string;
  output: string;
}
export interface IDoneCompletionMessage extends ICompletionMessage {
  type: "done";
  message: string;
  output: string;
}

export interface IErrorCompletionMessage extends ICompletionMessage {
  type: "error";
  message: string;
}

export type CompletionMessage =
  | ILoadingCompletionMessage
  | IGenerateCompletionMessage
  | IGeneratingCompletionMessage
  | IAbortCompletionMessage
  | IAbortedCompletionMessage
  | IDoneCompletionMessage
  | IErrorCompletionMessage;
