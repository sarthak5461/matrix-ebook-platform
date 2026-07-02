'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen, Home, Lock, Loader2 } from 'lucide-react'

export default function ReaderPage() {
  const router = useRouter()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [me, setMe] = useState(null)
  const [info, setInfo] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.3)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [pdfjsLib, setPdfjsLib] = useState(null)

  // Load PDF.js library once
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const meRes = await fetch('/api/auth/me').then(r => r.json())
      if (!meRes.user) { router.push('/login?next=/reader'); return }
      if (!meRes.user.purchasedBook) { toast.error('Purchase required'); router.push('/dashboard'); return }
      setMe(meRes.user)

      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs')
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs'
        if (!mounted) return
        setPdfjsLib(pdfjs)
        const infoRes = await fetch('/api/reader/info').then(r => r.json())
        if (infoRes.error) throw new Error(infoRes.error)
        setInfo(infoRes)
        const savedPage = Number(localStorage.getItem('msa_last_page') || 1)
        setPage(Math.min(Math.max(savedPage, 1), infoRes.pageCount))
      } catch (e) {
        toast.error('Failed to load reader: ' + e.message)
      } finally { setLoading(false) }
    })()
    return () => { mounted = false }
  }, [router])

  const renderPage = useCallback(async (pageNum) => {
    if (!pdfjsLib || !canvasRef.current) return
    setRendering(true)
    try {
      const res = await fetch(`/api/reader/page/${pageNum}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load page')
      const buf = await res.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: buf })
      const pdf = await loadingTask.promise
      const p = await pdf.getPage(1)
      const viewport = p.getViewport({ scale })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      await p.render({ canvasContext: ctx, viewport }).promise
      localStorage.setItem('msa_last_page', String(pageNum))
    } catch (e) {
      toast.error(e.message)
    } finally { setRendering(false) }
  }, [pdfjsLib, scale])

  useEffect(() => { if (info) renderPage(page) }, [page, scale, info, renderPage])

  // Anti-download / anti-print / anti-save protections
  useEffect(() => {
    const prevent = (e) => { e.preventDefault(); e.stopPropagation() }
    const kb = (e) => {
      const k = (e.key || '').toLowerCase()
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(k)) prevent(e)
      if (k === 'printscreen') { navigator.clipboard?.writeText('').catch(() => {}) }
    }
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('keydown', kb)
    document.addEventListener('dragstart', prevent)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('keydown', kb)
      document.removeEventListener('dragstart', prevent)
    }
  }, [])

  const goPrev = () => setPage(p => Math.max(1, p - 1))
  const goNext = () => setPage(p => Math.min(info?.pageCount || 1, p + 1))
  const zoomIn = () => setScale(s => Math.min(3, +(s + 0.2).toFixed(2)))
  const zoomOut = () => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(2)))

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading reader...</div>

  const progress = info ? Math.round((page / info.pageCount) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-900 text-white select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <div className="container h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center"><BookOpen className="h-4 w-4 text-white" /></div>
            <span className="hidden sm:inline">{info?.title || 'Matrix Structural Analysis'}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Lock className="h-3.5 w-3.5" /> <span className="hidden md:inline">Secure reading mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button size="sm" variant="outline" className="bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800"><Home className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <div className="container pb-2">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 tabular-nums">Page {page} / {info?.pageCount || '—'}</div>
            <Progress value={progress} className="h-1.5 flex-1 bg-slate-800" />
            <div className="text-xs text-slate-400 tabular-nums w-10 text-right">{progress}%</div>
          </div>
        </div>
      </header>

      <main ref={containerRef} className="flex flex-col items-center py-6 px-4">
        <div className="relative rounded-lg bg-white shadow-2xl overflow-hidden">
          <canvas ref={canvasRef} className="block" />
          {rendering && <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-slate-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {/* transparent overlay to make it harder to right-click / drag the canvas */}
          <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
        </div>
        <div className="text-xs text-slate-500 mt-3 flex items-center gap-1"><Lock className="h-3 w-3" /> Copyrighted content — online reading only. No download / print / save permitted.</div>
      </main>

      {/* Bottom control bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 bg-slate-950/95 border border-slate-800 rounded-full px-2 py-2 shadow-xl backdrop-blur">
          <Button size="sm" variant="ghost" onClick={goPrev} disabled={page <= 1} className="text-white hover:bg-slate-800 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
          <div className="px-3 text-sm tabular-nums text-slate-200">{page} / {info?.pageCount || '—'}</div>
          <Button size="sm" variant="ghost" onClick={goNext} disabled={page >= (info?.pageCount || 1)} className="text-white hover:bg-slate-800 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
          <div className="w-px h-6 bg-slate-800 mx-1" />
          <Button size="sm" variant="ghost" onClick={zoomOut} className="text-white hover:bg-slate-800 rounded-full"><ZoomOut className="h-4 w-4" /></Button>
          <div className="px-2 text-xs tabular-nums text-slate-300 w-14 text-center">{Math.round(scale * 100)}%</div>
          <Button size="sm" variant="ghost" onClick={zoomIn} className="text-white hover:bg-slate-800 rounded-full"><ZoomIn className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}
