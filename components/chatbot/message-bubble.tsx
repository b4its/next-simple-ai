"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Copy } from "lucide-react"

// Library Markdown & Syntax
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

// --- SUB-KOMPONEN: CodeBlock ---
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || "")
  const language = match ? match[1] : "text"
  const codeString = String(children).replace(/\n$/, "")

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // 1. JIKA CODE BLOCK (Multi-line)
  if (!inline && match) {
    return (
      <div className="relative my-4 overflow-hidden rounded-lg border border-border/40 bg-[#1e1e1e] shadow-md group not-prose">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-[#252526] px-3 py-1.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* macOS window dots */}
            <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
               <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
               <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="ml-2 text-[11px] font-medium text-gray-400 font-mono uppercase tracking-wider">
              {language === 'text' ? 'terminal' : language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-400 hover:bg-white/10 hover:text-white"
          >
            {isCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Area Kode / Output Terminal */}
        <div className="overflow-x-auto custom-scrollbar">
          <SyntaxHighlighter
            {...props}
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            showLineNumbers={language !== 'text' && language !== 'bash'} // Hide line numbers for terminal/bash
            wrapLines={false} // PENTING: False agar output ASCII tidak hancur
            lineNumberStyle={{ minWidth: "2.5em", paddingRight: "1em", color: "#6e7681", textAlign: "right", userSelect: "none" }}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '13px',
              lineHeight: '1.5',
              fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    )
  }

  // 2. JIKA INLINE CODE (seperti `const x`)
  return (
    <code
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[0.9em] font-medium break-words",
        props.isUser 
          ? "bg-white/20 text-white" 
          : "bg-muted text-foreground border border-border/50" 
      )}
      {...props}
    >
      {children}
    </code>
  )
}

// --- KOMPONEN UTAMA ---

interface MessageBubbleProps {
  content: string
  isUser: boolean
}

export function MessageBubble({ content, isUser }: MessageBubbleProps) {
  return (
    <div
      className={cn("flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300", {
        "flex-row-reverse": isUser,
        "flex-row": !isUser,
      })}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm mt-1">
          <AvatarImage src="/bot-avatar.png" alt="AI" />
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-white text-xs font-bold">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "relative px-4 py-3 max-w-[90%] md:max-w-[85%] shadow-sm text-sm overflow-hidden", 
          "rounded-2xl", 
          {
            "bg-primary text-primary-foreground rounded-tr-sm": isUser, 
            "bg-card border border-border/60 text-card-foreground rounded-tl-sm": !isUser, 
          }
        )}
      >
        <div
          // PERBAIKAN: Gunakan 'not-prose' pada tabel secara spesifik
          className={cn("prose min-w-0 max-w-none break-words dark:prose-invert", {
            "prose-p:text-primary-foreground prose-a:text-white": isUser,
            "prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground": !isUser,

            // Global Resets
            "prose-p:my-2 prose-p:leading-relaxed": true,
            "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:my-0": true,
            "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5": true,
            
            // PENTING: Nonaktifkan style tabel bawaan prose agar custom component kita yang dipakai
            "prose-table:not-prose": true, 
          })}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]} // PLUGIN INI WAJIB UNTUK RENDER TABEL
            components={{
              // Paragraph
              p({ children }) {
                return <p className="mb-2 last:mb-0 leading-6">{children}</p>
              },

              // Code
              code(props) {
                return <CodeBlock {...props} isUser={isUser} />
              },

              // List Fix (Hapus background pada list item)
              ul({children}) { return <ul className="list-disc pl-4 space-y-1">{children}</ul> },
              ol({children}) { return <ol className="list-decimal pl-4 space-y-1">{children}</ol> },
              li({children}) { return <li className="pl-1 bg-transparent">{children}</li> },

              // --- TABEL HANDLER (Grid Style) ---
              table({ children }) {
                return (
                  <div className="my-4 w-full overflow-hidden rounded-lg border border-border shadow-sm bg-background/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            {children}
                        </table>
                    </div>
                  </div>
                )
              },
              thead({ children }) { 
                return <thead className="bg-muted/80 border-b border-border">{children}</thead> 
              },
              tbody({ children }) {
                return <tbody className="divide-y divide-border/50 bg-card/50">{children}</tbody>
              },
              tr({ children }) { 
                return <tr className="hover:bg-muted/30 transition-colors group">{children}</tr> 
              },
              th({ children }) { 
                return (
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border/50 last:border-r-0">
                    {children}
                  </th>
                ) 
              },
              td({ children }) { 
                return (
                  <td className="px-4 py-3 align-top border-r border-border/50 last:border-r-0 whitespace-nowrap md:whitespace-normal text-foreground/90">
                    {children}
                  </td>
                ) 
              },

              // Link
              a({ href, children }) {
                return <a href={href} target="_blank" className="font-medium underline underline-offset-4 hover:text-primary transition-colors">{children}</a>
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}