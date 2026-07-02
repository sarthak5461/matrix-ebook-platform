'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { BookOpen } from 'lucide-react'

function Inner() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'
  const shouldBuy = params.get('buy') === '1'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Login failed')
      toast.success('Welcome back!')
      if (shouldBuy) router.push('/?buy=1')
      else router.push(next)
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center"><BookOpen className="h-4 w-4 text-white" /></div>
            <span className="font-bold">MatrixSA</span>
          </Link>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Login to continue reading</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div>
              <div className="flex items-center justify-between"><Label>Password</Label><Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot?</Link></div>
              <Input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            <div className="text-center text-sm text-muted-foreground">
              No account? <Link href="/register" className="text-indigo-600 hover:underline">Create one</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Page() {
  return <Suspense fallback={null}><Inner /></Suspense>
}
