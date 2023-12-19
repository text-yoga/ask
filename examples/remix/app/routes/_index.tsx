import Ask from "@text-yoga/ask/dist/ask.worker?worker";
import { useAsk } from "node_modules/@text-yoga/ask-react/dist/client";

export default function Index() {
  const { handleAsk, question, handleQuestionChange, answer } = useAsk({
    ask: Ask,
  });
  return (
    <div className="p-10 flex flex-col justify-start items-center w-full h-screen">
      <h1 className="text-4xl font-semibold">@text.yoga/ask</h1>
      <h2 className="text-2xl font-semibold mt-3 mb-10">remix example</h2>
      <div className="w-full lg:w-2/3 flex flex-col space-y-5">
        <form className="w-full flex flex-row space-x-5" onSubmit={handleAsk()}>
          <input
            className="border-2 border-slate-700 p-2 flex-grow focus:outline-none"
            name="question"
            type="text"
            placeholder="Ask me anything"
            value={question}
            onChange={handleQuestionChange}
          />
          <button
            className="w-36 h-16 border-slate-700 border-2 bg-violet-100 hover:bg-purple-200"
            type="submit"
          >
            Run
          </button>
        </form>
        <textarea
          className="border-2 border-slate-700 p-2 resize-none focus:outline-none h-56"
          value={answer}
          readOnly={true}
        />
      </div>
    </div>
  );
}
