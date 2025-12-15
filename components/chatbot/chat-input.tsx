// components/chatbot/chat-input.tsx
"use client" // Wajib ada karena menggunakan useState dan interaksi user

import { useState, KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

// 1. Definisikan Props yang diterima komponen ini
interface ChatInputProps {
  onSend: (message: string) => void // Fungsi untuk mengirim pesan ke parent
  disabled?: boolean                // Status apakah sedang loading/streaming
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  // 2. State lokal untuk menyimpan input user sebelum dikirim
  const [message, setMessage] = useState("")

  // Fungsi untuk menangani pengiriman
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message) // Kirim ke parent
      setMessage("")  // Reset input field
    }
  }

  // Fungsi agar user bisa tekan Enter untuk kirim (Shift+Enter untuk baris baru)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault() // Mencegah baris baru
      handleSend()
    }
  }

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background p-4 shadow-lg">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Ketik pesan Anda di sini..."
          className="min-h-[40px] flex-1 resize-none p-3 shadow-inner"
          rows={1}
          // 3. Binding state dan events
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled} // Disable textarea saat streaming
        />
        
        <Button 
          size="icon" 
          className="h-11 w-10 shrink-0"
          onClick={handleSend}
          disabled={disabled || !message.trim()} // Disable tombol jika kosong atau loading
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="mt-1 px-1 text-xs text-muted-foreground">
        AI dapat memberikan kesalahan silahkan untuk melakukan riset lebih lanjut untuk hasil yang lebih baik
      </p>
    </div>
  )
}