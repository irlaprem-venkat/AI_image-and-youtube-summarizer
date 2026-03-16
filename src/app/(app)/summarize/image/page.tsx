"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, ImageIcon, AlignLeft, List, Loader2, ArrowRight, FileText, Globe, CheckCircle2, UploadCloud, X } from "lucide-react";
import Image from "next/image";

export default function ImageSummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [mode, setMode] = useState<"tldr" | "bullet" | "study" | "blog" | "actions">("tldr");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    
    // Max 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File is too large. Max size is 10MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSummary(null);
    setExtractedText(null);
    
    // Create preview URL
    const objUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreviewUrl(null);
    setSummary(null);
    setExtractedText(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsSummarizing(true);
    setError(null);
    setSummary(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("mode", mode);

    try {
      const response = await fetch("/api/summarize/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setSummary(data.summary);
      setExtractedText(data.extractedText);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image & Doc Analyzer</h1>
          <p className="text-muted-foreground">Upload screenshots or documents to extract and summarize the text.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="glass-card md:col-span-1 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Upload Media</CardTitle>
            <CardDescription>Drag and drop an image file</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSummarize} className="space-y-6">
              
              {!previewUrl ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? "border-primary bg-primary/10" 
                      : "border-border/50 hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className={`w-8 h-8 mx-auto mb-3 ${isDragging ? "text-primary scale-110" : "text-muted-foreground"} transition-all duration-300`} />
                  <p className="text-sm font-medium mb-1">Click or drag image to upload</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-border/50 aspect-video bg-black/50">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      onClick={clearSelection}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label>Summary Output Type</Label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("tldr")}
                    className={`justify-start gap-2 h-9 px-3 ${mode === "tldr" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <AlignLeft className="w-4 h-4" /> TLDR
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("bullet")}
                    className={`justify-start gap-2 h-9 px-3 ${mode === "bullet" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <List className="w-4 h-4" /> Bullets
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("study")}
                    className={`justify-start gap-2 h-9 px-3 ${mode === "study" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <FileText className="w-4 h-4" /> Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("blog")}
                    className={`justify-start gap-2 h-9 px-3 ${mode === "blog" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <Globe className="w-4 h-4" /> Post
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => setMode("actions")}
                    className={`justify-start gap-2 h-9 px-3 col-span-2 lg:col-span-2 ${mode === "actions" ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}
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
                disabled={!file || isSummarizing}
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running OCR & Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract & Summarize
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={`glass-card md:col-span-2 border-border/50 transition-all duration-500 overflow-hidden ${summary ? 'ring-1 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Result Preview</span>
              {summary && (
                <Button variant="ghost" size="sm" className="h-8 gap-2 shrink-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                  Full Screen <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isSummarizing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 text-muted-foreground animate-pulse mt-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 relative z-10" />
                </div>
                <p>1. Extracting text via OCR engine...</p>
                <p className="opacity-50">2. Processing with Groq LLM...</p>
              </div>
            ) : summary ? (
              <div className="space-y-8 animate-in fade-in duration-1000">
                <div className="prose prose-invert prose-p:leading-relaxed max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>').replace(/##/g, '<h2 class="text-xl font-semibold mt-6 mb-3 text-emerald-500">').replace(/###/g, '<h3 class="text-lg font-medium mt-4 mb-2">').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
                
                {extractedText && (
                  <div className="pt-6 border-t border-border/50">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">RAW EXTRACTED TEXT</h4>
                    <div className="bg-black/30 text-muted-foreground p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/50 scrollbar-thin">
                      {extractedText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl p-12 mt-4">
                <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                <p>Your extracted summary will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
