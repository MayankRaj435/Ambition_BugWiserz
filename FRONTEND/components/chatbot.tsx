"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

export default function Chatbot() {
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send user message to backend
  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chatbot error");
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `❌ Error: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        💬
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-full bg-card shadow-2xl rounded-lg flex flex-col border border-border z-50">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/50 font-semibold text-foreground flex justify-between items-center rounded-t-lg">
        <span>AI Assistant</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto bg-background p-4 scroll-smooth h-80"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            Ask me anything about ML training!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 p-3 rounded-lg text-sm max-w-[85%] ${msg.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-muted text-foreground self-start"
              }`}
          >
            {msg.role === "bot" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                  remarkPlugins={[remarkMath]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-muted text-foreground p-3 rounded-lg text-sm animate-pulse">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-border bg-muted/50 flex gap-2 rounded-b-lg">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage(e)
            }
          }}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          rows={1}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          size="sm"
        >
          Send
        </Button>
      </form>
    </div>
  );
}
