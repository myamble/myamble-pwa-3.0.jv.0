"use client";
// why do we have two AIAnalysis components?
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { FileUpload } from "~/components/FileUpload";

export default function AIAnalysis() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const chatMutation = api.aiAnalysis.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.message },
      ]);
      setMessage("");
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullMessage = uploadedFile
      ? `Analyze the uploaded CSV file named "${uploadedFile.name}". ${message}`
      : message;
    chatMutation.mutate({ message: fullMessage });
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setChatHistory((prev) => [
      ...prev,
      { role: "system", content: `File uploaded: ${file.name}` },
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">AI Analysis</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
      <div className="mb-4 h-96 overflow-y-auto rounded-lg border p-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block rounded-lg p-2 ${
                msg.role === "user"
                  ? "bg-blue-100"
                  : msg.role === "system"
                    ? "bg-green-100"
                    : "bg-gray-100"
              }`}
            >
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        style={darcula}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question or request an analysis..."
          className="flex-grow"
        />
        <Button type="submit" disabled={chatMutation.isLoading}>
          {chatMutation.isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
