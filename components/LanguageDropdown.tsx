"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Globe } from 'lucide-react'
import { LOCALES, getLocale, setLocale, type Locale } from '@/lib/i18n'

export default function LanguageDropdown({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Locale>('en')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrent(getLocale())
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id: Locale) => {
    setLocale(id)
    setCurrent(id)
    setOpen(false)
    window.location.reload()
  }

  const currentLocale = LOCALES.find(l => l.id === current) || LOCALES[0]

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-900">
        <Globe className="w-3.5 h-3.5" />
        <span className="text-sm">{currentLocale.flag}</span>
        {!compact && <span className="text-xs font-medium hidden sm:block">{currentLocale.label}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 py-1 overflow-hidden">
          {LOCALES.map(locale => (
            <button key={locale.id} onClick={() => handleSelect(locale.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors ${locale.id === current ? 'bg-cashub-50 text-cashub-700 font-semibold' : 'text-neutral-700'}`}>
              <span className="text-base">{locale.flag}</span>
              <span>{locale.label}</span>
              {locale.id === current && <span className="ml-auto text-cashub-600 text-[10px] font-bold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
