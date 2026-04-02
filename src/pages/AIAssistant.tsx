import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FileUploadButton from "@/components/FileUploadButton";
import {
  Bot,
  Send,
  Loader2,
  Stethoscope,
  FileText,
  UserSearch,
  Sparkles,
  AlertTriangle,
  Trash2,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type MessageContent =
  | string
  | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;

type Msg = { role: "user" | "assistant"; content: string; aiContent?: MessageContent };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/healthcare-ai`;

const QUICK_ACTIONS = [
  {
    icon: Stethoscope,
    label: "Analyze Symptoms",
    prompt: "I have some symptoms I'd like to discuss with you.",
  },
  {
    icon: FileText,
    label: "Interpret Report",
    prompt: "I have a medical report I'd like you to help me understand. I'll upload the file.",
  },
  {
    icon: UserSearch,
    label: "Find Specialist",
    prompt: "Can you recommend what type of specialist I should see for my condition?",
  },
];

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || "Failed to connect to AI assistant");
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        /* ignore */
      }
    }
  }

  onDone();
}

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string, file?: File | null) => {
    const trimmed = text.trim();
    if ((!trimmed && !file) || isLoading) return;

    let messageContent = trimmed;
    let displayContent = trimmed;

    if (file) {
      try {
        const fileContent = await readFileAsText(file);
        const fileLabel = `📎 ${file.name}`;

        if (file.type.startsWith("image/")) {
          displayContent = trimmed ? `${fileLabel}\n\n${trimmed}` : fileLabel;
          messageContent = trimmed
            ? `[User uploaded an image: ${file.name}. Note: Image analysis is not available in text mode. Please ask the user to paste or type the report values instead.]\n\n${trimmed}`
            : `[User uploaded an image: ${file.name}. Note: Image analysis is not available in text mode. Please ask the user to paste or type the report values instead.]`;
        } else {
          displayContent = trimmed ? `${fileLabel}\n\n${trimmed}` : fileLabel;
          messageContent = trimmed
            ? `Here is the content of my uploaded file "${file.name}":\n\n---\n${fileContent}\n---\n\n${trimmed}`
            : `Here is the content of my uploaded file "${file.name}":\n\n---\n${fileContent}\n---\n\nPlease interpret this medical report for me, going through each finding one at a time.`;
        }
      } catch {
        toast({ title: "Error", description: "Could not read the file", variant: "destructive" });
        return;
      }
    }

    if (!messageContent) return;

    const userMsgDisplay: Msg = { role: "user", content: displayContent };
    const userMsgForAI: Msg = { role: "user", content: messageContent };

    setMessages((prev) => [...prev, userMsgDisplay]);
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    // Build AI message history (use display for past messages, AI content for current)
    const aiMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      userMsgForAI,
    ];

    try {
      await streamChat({
        messages: aiMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast({ title: "AI Error", description: msg, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input, attachedFile);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setAttachedFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex flex-col container max-w-3xl py-4 sm:py-6">
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">AI Health Assistant</h1>
              <p className="text-xs text-muted-foreground">Symptom analysis · Report interpretation · Specialist recommendations</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 mb-4 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p>
            This AI assistant provides <strong>informational guidance only</strong> and is not a substitute for professional medical advice.
            For emergencies, please call your local emergency services immediately.
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0 mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center max-w-sm">
                <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                  How can I help you today?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell me about your symptoms, upload a medical report, or ask for specialist recommendations.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => send(action.prompt)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:border-primary/40 hover:bg-accent/40 transition-colors"
                  >
                    <action.icon className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn("flex gap-2 max-w-[85%]", isUser && "flex-row-reverse")}>
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isUser ? "bg-primary" : "bg-primary/10"
                      )}
                    >
                      {isUser ? (
                        <span className="text-xs font-bold text-primary-foreground">
                          {user?.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-bl-md"
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl bg-card border border-border px-4 py-3 rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* CTA to find professionals */}
        {messages.length > 2 && (
          <div className="mb-3">
            <Link
              to="/professionals"
              className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
            >
              <UserSearch className="h-4 w-4" />
              <span className="font-medium">Ready to book? Find available professionals near you →</span>
            </Link>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input, attachedFile);
            }}
            className="flex flex-col gap-2"
          >
            {attachedFile && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <FileUp className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="ml-auto shrink-0 hover:text-foreground text-muted-foreground"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <FileUploadButton
                file={null}
                onFileSelect={setAttachedFile}
                disabled={isLoading}
              />
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms or upload a report..."
                className="flex-1 min-h-[44px] max-h-[120px] resize-none"
                disabled={isLoading}
                rows={1}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || (!input.trim() && !attachedFile)}
                className="shrink-0 h-11 w-11 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AIAssistant;
