'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, User2, Mail, CheckCircle2, XCircle, Calendar, ArrowRight, LogOut, Home } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login?next=/dashboard'); return }
      setMe(d.user); setLoading(false)
    })
  }, [router])

  const buy = async () => {
    try {
      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error || 'Failed')
      if (order.mock) {
        const ok = confirm(`MOCK PAYMENT MODE\n\nAmount: INR ${(order.amount/100).toFixed(2)}\n\nPress OK to simulate a successful payment.`)
        if (!ok) return
        const v = await fetch('/api/payment/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ razorpay_order_id: order.orderId, razorpay_payment_id: 'pay_mock', razorpay_signature: 'mock' }),
        })
        if (!v.ok) throw new Error('Verify failed')
        toast.success('Payment successful!')
        location.reload()
      }
    } catch (e) { toast.error(e.message) }
  }

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/' }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center"><BookOpen className="h-4 w-4 text-white" /></div>
            MatrixSA
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm"><Home className="h-4 w-4 mr-1" />Home</Button></Link>
            {me.role === 'admin' && <Link href="/admin"><Button variant="ghost" size="sm">Admin</Button></Link>}
            <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>
      <main className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hello, {me.name}!</h1>
          <p className="text-muted-foreground">Manage your account and access your ebook.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3"><User2 className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs text-muted-foreground">Name</div><div className="font-medium">{me.name}</div></div></div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs text-muted-foreground">Email</div><div className="font-medium">{me.email}</div></div></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><div><div className="text-xs text-muted-foreground">Member since</div><div className="font-medium">{new Date(me.createdAt).toLocaleDateString()}</div></div></div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 relative overflow-hidden">
            {me.purchasedBook ? (
              <>
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Purchased</Badge>
                    <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-700">Lifetime access</Badge>
                  </div>
                  <CardTitle className="text-2xl mt-3">Matrix Structural Analysis</CardTitle>
                  <CardDescription>by Dr. R. K. Sharma • 2025 Edition</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Your reading license is active. The ebook is streamed securely and cannot be downloaded, saved, or printed.</p>
                  <Link href="/reader"><Button size="lg" className="h-11">Read Ebook <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 w-fit"><XCircle className="h-3 w-3 mr-1" /> Not purchased</Badge>
                  <CardTitle className="text-2xl mt-3">Matrix Structural Analysis</CardTitle>
                  <CardDescription>Unlock lifetime reading access.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-1">₹149</div>
                  <p className="text-sm text-muted-foreground mb-4">One-time payment • Lifetime access • Read on any device.</p>
                  <Button size="lg" className="h-11" onClick={buy}>Buy Ebook <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
