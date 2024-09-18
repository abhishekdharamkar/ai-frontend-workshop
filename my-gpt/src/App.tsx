import { useState, useEffect, useRef } from "react";
import { getAnswer } from "./Langchain"; // Replace with your actual LangChain API call

export default function App() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<Array<{ type: "user" | "bot"; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (question.trim() === "") return;

    setError("");
    setLoading(true);

    // Save user's question
    setChat((prevChat) => [...prevChat, { type: "user", text: question }]);
    setQuestion(""); // Clear the input field after sending

    try {
      const result = await fetchWithRetry(() => getAnswer(question));
      setChat((prevChat) => [...prevChat, { type: "bot", text: result }]); // Save bot's response
    } catch (err) {
      setError("Error fetching response, please try again later.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWithRetry(
    fn: () => Promise<any>,
    retries = 3,
    delay = 1000
  ): Promise<any> {
    try {
      return await fn();
    } catch (err: any) {
      if (err.response && err.response.status === 429 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
      }
      throw err;
    }
  }

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      <div className="flex max-w-full flex-1 flex-col">
        <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
          <div className="flex-1 dark:bg-gray-800 flex flex-col">
            <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600 flex gap-4 p-4 items-center justify-center">
              My AI
            </h1>

            {/* Scrollable chat container */}
            <div
              className="flex-1 overflow-y-auto p-4"
              ref={chatContainerRef}
              style={{ maxHeight: "calc(100vh - 180px)" }} // Adjust height as needed
            >
              <div className="chat-box flex flex-col gap-4 w-full">
                {chat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${
                        msg.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-xs md:max-w-md p-3 bg-gray-200 text-black rounded-lg text-sm">
                      Loading...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed input area */}
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2">
            <form
              onSubmit={handleSubmit}
              className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
            >
              <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
                <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                  <textarea
                    value={question}
                    tabIndex={0}
                    data-id="root"
                    placeholder="Send a message..."
                    className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 dark:bg-transparent pl-2 md:pl-0"
                    onChange={(e) => setQuestion(e.currentTarget.value)}
                  ></textarea>
                  <button
                    type="submit"
                    className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                    disabled={!question.trim() || loading}
                  >
                    &#11157;
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
