"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Youtube, Image as ImageIcon, Globe, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-foreground overflow-hidden selection:bg-primary/30 relative">
      {/* Background Effects (Replaced by AnimatedBackground) */}

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 items-center flex justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">OmniSummarize</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="gap-2 shadow-[0_0_20px_var(--primary)/30] hover:shadow-[0_0_30px_var(--primary)/50] transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            Introducing the ultimate AI knowledge companion
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight tight-leading mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
            Understand <span className="text-gradient">anything</span> <br className="hidden md:block"/> in seconds.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            Transform hours of YouTube videos, endless web articles, confusing images, and long documents into clear, actionable summaries using advanced AI models.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 fill-mode-both">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base shadow-[0_0_30px_var(--primary)/40] hover:shadow-[0_0_50px_var(--primary)/60] transition-all w-full sm:w-auto">
                Start Summarizing for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-background/50 backdrop-blur border-border/50 hover:bg-secondary w-full sm:w-auto">
              View Live Demo
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Image/Mock */}
        <div className="container mx-auto mt-20 max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-700 fill-mode-both relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-black/40 shadow-2xl overflow-hidden glass aspect-video">
            <div className="absolute top-0 inset-x-0 h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
            </div>
            {/* Mock Dashboard UI inside hero */}
            <div className="pt-12 p-8 grid grid-cols-12 gap-6 h-full opacity-80">
              <div className="col-span-3 border-r border-white/5 pr-6 hidden md:block space-y-4">
                <div className="h-8 bg-white/10 rounded-md w-full mb-8"></div>
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
              </div>
              <div className="col-span-12 md:col-span-9 space-y-6">
                <div className="h-10 bg-white/10 rounded-lg w-1/3"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white/5 rounded-xl"></div>
                  <div className="h-32 bg-white/5 rounded-xl"></div>
                </div>
                <div className="h-48 bg-primary/20 outline outline-1 outline-primary/50 shadow-[0_0_30px_var(--primary)/20] rounded-xl p-6">
                  <div className="w-full h-4 bg-primary/40 rounded mt-4"></div>
                  <div className="w-3/4 h-4 bg-primary/30 rounded mt-4"></div>
                  <div className="w-5/6 h-4 bg-primary/20 rounded mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">One platform to summarize it all</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Stop reading endless text. Let our advanced AI distill the core knowledge for you instantly.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="glass-card p-8 border-none hover-glow group transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl w-fit mb-6">
                <Youtube className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">YouTube Videos</h3>
              <p className="text-muted-foreground leading-relaxed">Paste any URL to extract transcripts and generate timestamped insights, bullet points, and actionable steps without watching.</p>
            </div>
            
            <div className="glass-card p-8 border-none hover-glow group transition-all duration-300 relative overflow-hidden mt-0 lg:mt-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Web Articles</h3>
              <p className="text-muted-foreground leading-relaxed">Bypass clutter, ads, and filler text. Extract the exact meaning of news articles, blogs, research pages, and docs.</p>
            </div>
            
            <div className="glass-card p-8 border-none hover-glow group transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit mb-6">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Images & OCR</h3>
              <p className="text-muted-foreground leading-relaxed">Upload screenshots, infographics, or scanned documents. OmniSummarize extracts the text and analyzes the layout for you.</p>
            </div>
            
            <div className="glass-card p-8 border-none hover-glow group transition-all duration-300 relative overflow-hidden mt-0 lg:mt-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
              <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-muted-foreground leading-relaxed">Paste massive walls of text, emails, or chat logs. Select from modes like &apos;TLDR&apos;, &apos;Study Notes&apos;, or &apos;Key Insights&apos;.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Smart Modes */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-foreground border border-border/50 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                Adaptive AI Engine
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Summaries tailored to your exact needs.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Not all content is the same. Choose exactly how you want your information presented, powered by ultra-fast Groq LLM inferencing.
              </p>
              <ul className="grid grid-cols-2 gap-4 pt-4">
                {['TLDR Quick Summary', 'Detailed Bullet points', 'Study Notes', 'Key Action Items', 'Blog Style', 'Timestamp Highlights'].map((mode, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {mode}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="md:w-1/2 w-full">
              <div className="glass-card border border-primary/20 p-6 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-20" />
                <div className="relative bg-black/60 backdrop-blur-3xl rounded-xl p-6 border border-white/10 font-mono text-sm leading-relaxed text-blue-200">
                  <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                    <div className="px-3 py-1 bg-primary/20 text-primary rounded-md text-xs font-sans font-bold">MODE: STUDY NOTES</div>
                  </div>
                  <span className="text-primary font-bold">#</span> Concept: React Server Components <br/><br/>
                  <span className="text-primary font-bold">-</span> Definition: Components that render entirely on the server. <br/>
                  <span className="text-primary font-bold">-</span> Benefit: Zero javascript sent to client. Improves page load significantly. <br/>
                  <span className="text-primary font-bold">-</span> Usage: By default in Next.js App Router unless marked with &apos;use client&apos;. <br/><br/>
                  <div className="animate-pulse bg-primary/30 w-2 h-4 inline-block ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/10 py-12 px-6 mt-12 text-center md:text-left">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2 group cursor-pointer">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">OmniSummarize</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto md:mx-0">
              The fastest way to distil knowledge across any medium. Engineered for speed and precision.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API (Coming Soon)</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto border-t border-border/50 mt-12 pt-8 text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} OmniSummarize AI. All rights reserved. Built for knowledge workers.
        </div>
      </footer>
    </div>
  );
}
