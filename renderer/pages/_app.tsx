import React from 'react'
import type { AppProps } from 'next/app'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster, ToasterProps } from 'sonner'
import { FaCheckCircle } from "react-icons/fa"
import '@/styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppLayout>
      <Component {...pageProps} />
      <Toaster 
        position="bottom-right"
        theme="light"
        richColors
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          className: 'text-sm',
        }}
        icons={{
          success: <FaCheckCircle className="h-4 w-4 text-emerald-500" />
        }}
      />
    </AppLayout>
  )
}
