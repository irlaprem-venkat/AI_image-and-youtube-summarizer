"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Globe, Image as ImageIcon, Plus, Youtube } from "lucide-react";
import Link from "next/link";

const RECENT_SUMMARIES = [
  { id: 1, title: "Next.js 14 App Router Course", type: "youtube", date: "2 hours ago", icon: Youtube },
  { id: 2, title: "Understanding React Server Components", type: "url", date: "5 hours ago", icon: Globe },
  { id: 3, title: "Meeting Notes - Q3 Planning", type: "text", date: "Yesterday", icon: FileText },
  { id: 4, title: "Invoice #1024 - Stripe", type: "image", date: "3 days ago", icon: ImageIcon },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Heres an overview of your summaries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            History
          </Button>
          <Link href="/summarize/youtube">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              New Summary
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Summaries</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">+14% from last month</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YouTube Videos</CardTitle>
            <Youtube className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Web Articles</CardTitle>
            <Globe className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52</div>
            <p className="text-xs text-muted-foreground mt-1">+8 this week</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Words Saved</CardTitle>
            <Clock className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~450k</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated reading time: 40h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Summaries</h2>
          <div className="grid gap-4">
            {RECENT_SUMMARIES.map((summary) => (
              <Card key={summary.id} className="glass border-border/50 hover-glow group cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <summary.icon className={`w-5 h-5 ${
                        summary.type === 'youtube' ? 'text-red-500' : 
                        summary.type === 'url' ? 'text-blue-500' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {summary.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{summary.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
          <Card className="glass border-border/50">
            <CardContent className="p-4 flex flex-col gap-3">
              <Link href="/summarize/youtube" className="w-full">
                <Button variant="secondary" className="w-full justify-start gap-3 hover:bg-primary/20 hover:text-primary transition-all">
                  <Youtube className="w-4 h-4 text-red-500" />
                  Summarize YouTube
                </Button>
              </Link>
              <Link href="/summarize/url" className="w-full">
                <Button variant="secondary" className="w-full justify-start gap-3 hover:bg-primary/20 hover:text-primary transition-all">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Summarize Web Article
                </Button>
              </Link>
              <Link href="/summarize/image" className="w-full">
                <Button variant="secondary" className="w-full justify-start gap-3 hover:bg-primary/20 hover:text-primary transition-all">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Analyze Image
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
