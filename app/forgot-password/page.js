'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { BookOpen } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      toast.success('If your email exists, a reset link was sent.')
      setSent(true)
    } catch (e) { toast.error(e.message) } finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center"><BookOpen className="h-4 w-4 text-white" /></div>
            <span className="font-bold">MatrixSA</span>
          </Link>
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>We'll email a reset link to you.</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-sm text-muted-foreground">
              If an account exists for <b>{email}</b>, a reset link has been sent. Check your inbox (and spam folder).
              <div className="mt-4"><Link href="/login" className="text-indigo-600 hover:underline">Back to login</Link></div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
              <Button className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
              <div className="text-center text-sm text-muted-foreground"><Link href="/login" className="text-indigo-600 hover:underline">Back to login</Link></div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
