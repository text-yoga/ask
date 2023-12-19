import Ask from "@text-yoga/ask/dist/ask.worker?worker";
import { useAsk } from "node_modules/@text-yoga/ask-react/dist/client";

export default function Index() {
  const { handleAsk, question, handleQuestionChange, answer } = useAsk({
    ask: Ask,
  });
  return (
    <div>
      <h1>Test</h1>
      <form onSubmit={handleAsk()}>
        <input
          name="question"
          type="text"
          placeholder="Ask me anything"
          value={question}
          onChange={handleQuestionChange}
        />
        <button type="submit">Run</button>
        <div>{answer}</div>
      </form>
    </div>
  );
}
