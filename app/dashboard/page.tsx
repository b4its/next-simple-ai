"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { MessageBubble } from "@/components/chatbot/message-bubble"
import { ChatInput } from "@/components/chatbot/chat-input" // Pastikan komponen ini menerima props onSend
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Definisikan tipe pesan
type Message = {
  id: number
  content: string
  isUser: boolean
}

export default function Page() {
  // 1. State untuk menyimpan pesan
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Halo! Saya adalah Kivo Asisten anda. Ada yang bisa saya bantu hari ini?", isUser: false },
  ])
  
  // State untuk loading dan streaming status
  const [isLoading, setIsLoading] = useState(false)
  
  // Ref untuk auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null)

  // 2. Efek untuk Auto-scroll ke bawah saat pesan bertambah/ter-update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

// 3. Fungsi Utama Pengirim Pesan & Streaming
  const handleSendMessage = async (inputMessage: string) => {
    if (!inputMessage.trim() || isLoading) return

    const userMsgId = Date.now()
    const newUserMsg: Message = { id: userMsgId, content: inputMessage, isUser: true }
    
    // Placeholder pesan AI
    const aiMsgId = userMsgId + 1
    const newAiMsg: Message = { id: aiMsgId, content: "", isUser: false }

    setMessages((prev) => [...prev, newUserMsg, newAiMsg])
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/chat", { // Sesuaikan port jika diganti
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (!response.ok || !response.body) {
        throw new Error(response.statusText)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiResponseText = ""
      let buffer = "" // Buffer untuk menangani potongan data yang terpotong di tengah JSON

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 1. Decode stream menjadi text
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 2. Split berdasarkan baris baru (karena SSE mengirim data per baris)
        const lines = buffer.split("\n")
        
        // Simpan sisa baris terakhir yang mungkin belum lengkap ke buffer
        buffer = lines.pop() || "" 

        for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            // 3. Bersihkan prefix "data:" yang mungkin berulang (contoh: "data: data: data: {json}")
            // Regex ini menghapus semua kata "data:" di awal string
            const cleanLine = trimmedLine.replace(/^(data:\s*)+/, "")

            // 4. Cek tanda selesai
            if (cleanLine === "[DONE]") continue

            try {
                // 5. Parse JSON
                const parsed = JSON.parse(cleanLine)
                
                // 6. Ambil konten teks dari struktur OpenAI/Kolosal
                // Struktur: choices[0].delta.content
                const content = parsed.choices?.[0]?.delta?.content

                if (content) {
                    aiResponseText += content
                    
                    // 7. Update UI
                    setMessages((prev) => 
                        prev.map((msg) => 
                            msg.id === aiMsgId 
                                ? { ...msg, content: aiResponseText } 
                                : msg
                        )
                    )
                }
            } catch (e) {
                // Abaikan error parsing jika baris bukan JSON valid (misal ping keep-alive)
                console.warn("Gagal parse baris:", cleanLine)
            }
        }
      }

    } catch (error) {
      console.error("Error streaming:", error)
      setMessages((prev) => [
        ...prev, 
        { id: Date.now(), content: "Maaf, terjadi kesalahan koneksi.", isUser: false }
      ])
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Panel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </header>

        {/* Konten Utama Chatbot */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="flex h-full min-h-[calc(100vh-8rem)] flex-col md:min-h-0"> 
            
            <CardHeader className="sticky top-0 z-20 border-b bg-card">
              <CardTitle>💬 Kivo Assistant</CardTitle>
              <CardDescription>Ngobrol dengan Kivo: Rust Backend Powered.</CardDescription>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-6">
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    content={msg.content} 
                    isUser={msg.isUser} 
                  />
                ))}
                {/* Indikator Loading (Opsional, jika ingin animasi titik-titik saat menunggu first byte) */}
                {isLoading && messages[messages.length - 1].isUser && (
                    <div className="text-sm text-muted-foreground animate-pulse pl-4">Sedang mengetik...</div>
                )}
                {/* Dummy div untuk scroll anchor */}
                <div ref={scrollRef} /> 
              </div>
            </ScrollArea>

            {/* Area Input */}
            {/* PENTING: ChatInput harus support prop onSend dan disabled */}
            <ChatInput 
                onSend={handleSendMessage} 
                disabled={isLoading} 
            />

          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}