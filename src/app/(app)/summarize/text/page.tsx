"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, FileText, AlignLeft, List, Loader2, ArrowRight, Globe, CheckCircle2 } from "lucide-react";

export default function TextSummarizerPage() {
  const [text, setText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [mode, setMode] = useState<"tldr" | "bullet" | "study" | "blog" | "actions">("tldr");
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || text.trim().length < 10) return;
    
    setIsSummarizing(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch("/api/summarize/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize text");
      }

      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Text Summarizer</h1>
          <p className="text-muted-foreground">Paste large walls of text, chat logs, or documents and let AI distill the core ideas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              Input Text
              <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {text.length} characters
              </span>
            </CardTitle>
            <CardDescription>Paste the content you want to summarize.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSummarize} className="space-y-6">
              <div className="space-y-2">
                <Textarea 
                  id="text" 
                  placeholder="Insert your long text here... (minimum 50 characters requested for best results)" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-secondary/50 border-none transition-all focus-visible:ring-primary/50 min-h-[300px] resize-y"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Summary Output Type</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("tldr")}
                    className={`gap-2 h-9 px-3 ${mode === "tldr" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <AlignLeft className="w-4 h-4" /> TLDR
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("bullet")}
                    className={`gap-2 h-9 px-3 ${mode === "bullet" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <List className="w-4 h-4" /> Bullets
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("study")}
                    className={`gap-2 h-9 px-3 ${mode === "study" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <FileText className="w-4 h-4" /> Study Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("blog")}
                    className={`gap-2 h-9 px-3 ${mode === "blog" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <Globe className="w-4 h-4" /> Blog Post
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("actions")}
                    className={`gap-2 h-9 px-3 ${mode === "actions" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Action Items
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gap-2 transition-all shadow-[0_0_20px_var(--primary)/20] hover:shadow-[0_0_30px_var(--primary)/40]" 
                disabled={!text || isSummarizing}
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating from text...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={`glass-card border-border/50 transition-all duration-500 overflow-hidden ${summary ? 'ring-1 ring-primary/30 shadow-[0_0_30px_var(--primary)/10]' : ''}`}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Result Preview</span>
              {summary && (
                <Button variant="ghost" size="sm" className="h-8 gap-2 shrink-0 text-primary hover:text-primary hover:bg-primary/10">
                  Copy Output <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isSummarizing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-muted-foreground animate-pulse mt-32">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                </div>
                <p>Analyzing and synthesizing information...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-invert prose-p:leading-relaxed max-w-none animate-in fade-in duration-1000">
                <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>').replace(/##/g, '<h2 class="text-xl font-semibold mt-6 mb-3 text-primary">').replace(/###/g, '<h3 class="text-lg font-medium mt-4 mb-2">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl p-12 mt-4">
                <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-center">Summarized output will appear here once generated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
