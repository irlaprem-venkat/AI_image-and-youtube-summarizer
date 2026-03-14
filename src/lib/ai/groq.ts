import Groq from "groq-sdk";

// Initialize the Groq client
// It will automatically use the GROQ_API_KEY environment variable if instantiated without arguments,
// but we pass it explicitly for clarity.
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

export type SummaryMode = 'tldr' | 'bullet' | 'study' | 'blog' | 'insights' | 'actions';

export const SYSTEM_PROMPTS: Record<SummaryMode, string> = {
  tldr: "You are a world-class expert at summarizing complex information. Provide a concise, 2-3 paragraph TL;DR that captures the core essence of the provided text. Do not use bullet points or filler text. Get straight to the point.",
  bullet: "You are a master summarizer. Extract the most important information from the text and present it as a clear, hierarchical list of bullet points. Use bolding to highlight key terms.",
  study: "You are an expert tutor. Convert the provided text into comprehensive study notes. Organize the content with clear headings (##), define key concepts clearly, and provide examples if they exist in the text. Make it easy to review for an exam.",
  blog: "You are a professional tech blogger. Rewrite the core messages of the provided text into an engaging, well-structured blog post. Give it a catchy title, use markdown formatting, and make it readable for a general audience.",
  insights: "You are a seasoned analyst. Read the text and extract exclusively the non-obvious, high-value 'Key Insights'. What are the deeper meanings or paradigm shifts? Provide 5-7 profound insights formatted as a markdown list.",
  actions: "You are an executive assistant. Read the text and extract only the actionable next steps, recommendations, or tasks. Present them as a to-do list.",
};

export async function generateSummary(text: string, mode: SummaryMode = 'tldr', maxTokens: number = 800) {
  try {
    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.tldr;
    
    // We use llama3-8b-8192 for extreme speed and low cost, 
    // or mixtral-8x7b-32768 if larger context is needed. 
    // Defaulting to the incredibly fast Llama 3 8B.
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please summarize the following text:\n\n${text}` }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3, // Lower temperature for more focused, deterministic summaries
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new Error("Failed to generate summary with Groq");
  }
}
