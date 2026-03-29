"use client"

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Image as ImageIcon, Upload, Trash2, Plus, RefreshCw, CheckCircle, AlertCircle, GripVertical, X, Eye } from 'lucide-react'

interface SlideConfig {
  id: string
  image: string
  title: string
  subtitle: string
  gradient: string
}

const GRADIENTS = [
  { label: 'Blue/Indigo', value: 'from-blue-800 via-blue-900 to-indigo-900' },
  { label: 'Green/Emerald', value: 'from-green-800 via-green-900 to-emerald-900' },
  { label: 'Orange/Red', value: 'from-orange-800 via-orange-900 to-red-900' },
  { label: 'Purple/Indigo', value: 'from-purple-800 via-purple-900 to-indigo-900' },
  { label: 'Teal/Green', value: 'from-teal-700 via-teal-800 to-green-900' },
  { label: 'Rose/Red', value: 'from-rose-700 via-rose-800 to-red-900' },
  { label: 'Amber/Orange', value: 'from-amber-800 via-amber-900 to-orange-900' },
]

const DEFAULT_SLIDES: SlideConfig[] = [
  { id: '1', image: '/slides/slide-team.jpg', gradient: 'from-blue-800 via-blue-900 to-indigo-900', title: 'Your Trusted Lending Partner', subtitle: 'Join thousands of satisfied customers who trust CasHuB for their financial needs.' },
  { id: '2', image: '/slides/slide-school.jpg', gradient: 'from-green-800 via-green-900 to-emerald-900', title: 'Back to School Loans', subtitle: 'Get same-day approval for school fees, uniforms, and supplies.' },
  { id: '3', image: '/slides/slide-van.jpg', gradient: 'from-orange-800 via-orange-900 to-red-900', title: 'Transport & Business Solutions', subtitle: 'Finance for vehicles, equipment, and business expansion. Grow with CasHuB.' },
  { id: '4', image: '/slides/slide1-new.jpg', gradient: 'from-indigo-800 via-indigo-900 to-purple-900', title: 'Modern Lending Platform', subtitle: 'Experience the future of microlending with CasHuB platform.' },
  { id: '5', image: '/slides/bus.jpg', gradient: 'from-green-800 via-green-900 to-emerald-900', title: 'Transport Solutions', subtitle: 'Quick financing for transport, logistics and business needs.' },
  { id: '6', image: '/slides/wear.jpg', gradient: 'from-amber-800 via-amber-900 to-orange-900', title: 'Fashion & Retail', subtitle: 'Flexible payment plans for clothing, accessories and retail.' },
]

export default function BrandingPage() {
  const [slides, setSlides] = useState<SlideConfig[]>(DEFAULT_SLIDES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewSlide, setPreviewSlide] = useState<SlideConfig | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('loginSlides')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed.map((s: any, i: number) => ({ ...s, id: s.id || String(i + 1) })))
        }
      } catch {}
    }
    // Also try to load from DB
    supabase.from('system_settings').select('value').eq('key', 'login_slides').maybeSingle().then(({ data }) => {
      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed.map((s: any, i: number) => ({ ...s, id: s.id || String(i + 1) })))
          }
        } catch {}
      }
    })
  }, [])

  const handleFileUpload = async (file: File, slideId: string) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    setUploading(slideId)
    setError('')
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `slide-${slideId}-${Date.now()}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filename, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        // Fallback: use object URL for local preview (won't persist across deploys)
        const objectUrl = URL.createObjectURL(file)
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, image: objectUrl } : s))
        setError('Storage bucket not configured. Image previewed locally only. Set up Supabase Storage "branding" bucket for persistence.')
      } else {
        const { data: urlData } = supabase.storage.from('branding').getPublicUrl(filename)
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, image: urlData.publicUrl } : s))
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    }
    setUploading(null)
  }

  const saveSlides = async () => {
    setSaving(true)
    setError('')
    try {
      // Strip blob:// URLs — they are session-only and will break on other devices/login page
      const cleanSlides = slides.map(s => ({
        ...s,
        image: s.image.startsWith('blob:') ? '/slides/slide1-new.jpg' : s.image,
      }))

      const slidesData = JSON.stringify(cleanSlides)
      localStorage.setItem('loginSlides', slidesData)

      // Check if record exists, then insert or update accordingly
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', 'login_slides')
        .maybeSingle()

      if (existing?.id) {
        const { error: updateErr } = await supabase
          .from('system_settings')
          .update({ value: slidesData })
          .eq('key', 'login_slides')
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('system_settings')
          .insert({ key: 'login_slides', value: slidesData })
        if (insertErr) throw insertErr
      }

      // Check if any slides still have blob URLs (storage not configured)
      const hasBlobUrls = slides.some(s => s.image.startsWith('blob:'))
      if (hasBlobUrls) {
        setError('⚠ Some images were uploaded without persistent storage. Set up the Supabase "branding" storage bucket so images survive across sessions. Slide text/titles were saved.')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Error saving slides to database')
    }
    setSaving(false)
  }

  const addSlide = () => {
    const newId = String(Date.now())
    setSlides(prev => [...prev, {
      id: newId,
      image: '/slides/slide1-new.jpg',
      title: 'New Slide',
      subtitle: 'Enter a subtitle here.',
      gradient: 'from-blue-800 via-blue-900 to-indigo-900',
    }])
    setEditingId(newId)
  }

  const deleteSlide = (id: string) => {
    if (slides.length <= 1) { setError('At least one slide is required'); return }
    setSlides(prev => prev.filter(s => s.id !== id))
  }

  const updateSlide = (id: string, field: keyof SlideConfig, value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const resetToDefaults = () => {
    if (!confirm('Reset all slides to defaults? This will remove your custom slides.')) return
    setSlides(DEFAULT_SLIDES)
    localStorage.removeItem('loginSlides')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Platform Branding</h2>
          <p className="text-sm text-neutral-500">Manage login page slides, images, and platform visuals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefaults} className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50">
            Reset Defaults
          </button>
          <button onClick={saveSlides} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-cashub-600 hover:bg-cashub-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Changes saved! Login page will now show updated slides.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>How it works:</strong> Upload images below and edit slide titles/subtitles. Click "Save Changes" to publish. The login page will immediately reflect your changes. Requires Supabase Storage "branding" bucket for persistent image hosting.
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-neutral-100">
              <GripVertical className="w-5 h-5 text-neutral-300 flex-shrink-0" />
              <span className="text-sm font-bold text-neutral-700">Slide {idx + 1}</span>
              <div className="flex-1" />
              <button onClick={() => setPreviewSlide(slide)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-cashub-600 border border-neutral-200 rounded-lg">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                className="px-3 py-1.5 text-xs font-medium text-cashub-700 bg-cashub-50 border border-cashub-200 rounded-lg hover:bg-cashub-100"
              >
                {editingId === slide.id ? 'Done' : 'Edit Text'}
              </button>
              <button onClick={() => deleteSlide(slide.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col sm:flex-row gap-4">
              {/* Image Preview + Upload */}
              <div className="flex-shrink-0">
                <div className={`w-full sm:w-48 h-32 rounded-xl overflow-hidden relative bg-gradient-to-br ${slide.gradient}`}>
                  {slide.image && (
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-bold truncate">{slide.title}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={uploadTargetId === slide.id ? fileInputRef : undefined}
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], slide.id)
                      e.target.value = ''
                    }}
                  />
                  <button
                    onClick={() => {
                      setUploadTargetId(slide.id)
                      // Create a file input dynamically
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleFileUpload(file, slide.id)
                      }
                      input.click()
                    }}
                    disabled={uploading === slide.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-medium text-neutral-700 disabled:opacity-50"
                  >
                    {uploading === slide.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading === slide.id ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                {/* Or enter URL */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={slide.image}
                    onChange={e => updateSlide(slide.id, 'image', e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full px-2 py-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-700 focus:ring-2 focus:ring-cashub-500"
                  />
                </div>
              </div>

              {/* Text fields */}
              <div className="flex-1 space-y-3">
                {editingId === slide.id ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Slide Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={e => updateSlide(slide.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
                        placeholder="Enter slide title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle</label>
                      <textarea
                        value={slide.subtitle}
                        onChange={e => updateSlide(slide.id, 'subtitle', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-cashub-500"
                        placeholder="Enter slide subtitle"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Background Gradient</label>
                      <select
                        value={slide.gradient}
                        onChange={e => updateSlide(slide.id, 'gradient', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-cashub-500"
                      >
                        {GRADIENTS.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">{slide.title}</p>
                    <p className="text-xs text-neutral-500">{slide.subtitle}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">Image: {slide.image}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slide */}
      <button
        onClick={addSlide}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-neutral-300 rounded-2xl text-sm font-medium text-neutral-500 hover:border-cashub-400 hover:text-cashub-600 hover:bg-cashub-50 transition-all"
      >
        <Plus className="w-4 h-4" /> Add New Slide
      </button>

      {/* Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Slide Preview</h3>
              <button onClick={() => setPreviewSlide(null)} className="p-1 hover:bg-neutral-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className={`relative h-64 bg-gradient-to-br ${previewSlide.gradient}`}>
              {previewSlide.image && (
                <img src={previewSlide.image} alt={previewSlide.title} className="absolute inset-0 w-full h-full object-cover opacity-70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl font-extrabold text-white mb-1">{previewSlide.title}</h2>
                <p className="text-sm text-white/80">{previewSlide.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
