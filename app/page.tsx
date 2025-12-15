'use-client'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
      <div style={{        
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}>
        <Button>Selamat Datang</Button>
      </div>
);
}
