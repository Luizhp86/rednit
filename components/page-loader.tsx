'use client'

import { Sparkles } from 'lucide-react'

type PageLoaderProps = {
  message?: string
}

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[80px] animate-pulse" />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-spin">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}
