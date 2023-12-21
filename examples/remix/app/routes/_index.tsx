import Ask from "@text-yoga/ask/dist/ask.worker?worker";
import { useAsk } from "node_modules/@text-yoga/ask-react/dist/client";

export default function Index() {
  const {
    questionValue,
    onQuestionSubmit,
    onQuestionChange,
    answerValue,
    meta,
    isLoading,
    message,
  } = useAsk({
    ask: Ask,
  });
  return (
    <div className="p-10 flex flex-col justify-start items-center w-full h-screen">
      <h1 className="text-4xl font-semibold mb-10">@text.yoga/ask</h1>
      <div className="w-full lg:w-2/3 flex flex-col space-y-5">
        <form
          className="w-full flex flex-row space-x-5"
          onSubmit={onQuestionSubmit({})}
        >
          <input
            className="border-2 border-slate-700 p-2 flex-grow focus:outline-none shadow-[4px_4px_0px]"
            name="question"
            type="text"
            placeholder="Ask me anything"
            value={questionValue}
            onChange={onQuestionChange}
          />
          <button
            className="w-36 h-16 border-slate-700 border-2 bg-violet-100 hover:bg-purple-200 shadow-[4px_4px_0px]"
            type="submit"
          >
            {isLoading ? "Cancel" : "Run"}
          </button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-x-2">
            <span>Tokens / s</span>
            <span>{meta.tokensSec.toFixed(2)}</span>
          </div>
          <div className="space-x-2">
            <span>Total time</span>
            <span>{meta.totalTime} ms</span>
          </div>
          <div className="space-x-2">
            <span>Status</span>
            <span>{message}</span>
          </div>
        </div>
        <textarea
          className="border-2 border-slate-700 p-2 resize-none focus:outline-none h-56 shadow-[4px_4px_0px]"
          value={answerValue}
          onChange={() => {}}
          // readOnly={true}
        />
      </div>
    </div>
  );
}
