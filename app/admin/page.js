'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Users, ShoppingCart, IndianRupee, Download, Upload, BookOpen, Home, LogOut, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [me, setMe] = useState(null)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [pdfInfo, setPdfInfo] = useState(null)
  const fileRef = useRef(null)

  const loadAll = async () => {
    const [s, u, p] = await Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/purchases').then(r => r.json()),
    ])
    if (s.error) throw new Error(s.error)
    setStats(s); setUsers(u.users || []); setPurchases(p.purchases || [])
  }

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me').then(r => r.json())
      if (!meRes.user) { router.push('/login?next=/admin'); return }
      if (meRes.user.role !== 'admin') { toast.error('Admin only'); router.push('/dashboard'); return }
      setMe(meRes.user)
      try { await loadAll() } catch (e) { toast.error(e.message) }
      setLoading(false)
    })()
  }, [router])

  const uploadPdf = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) { toast.error('Only PDF files allowed'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-pdf', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Upload failed')
      setPdfInfo(d)
      toast.success(`Uploaded! ${d.pageCount} pages`)
    } catch (e) { toast.error(e.message) } finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/' }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading admin...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center"><BookOpen className="h-4 w-4 text-white" /></div>
            MatrixSA <Badge variant="outline" className="ml-2">Admin</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm"><Home className="h-4 w-4 mr-1" />Home</Button></Link>
            <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>
      <main className="container py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Users, purchases, revenue & ebook management</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} accent="bg-blue-100 text-blue-700" />
          <StatCard icon={ShoppingCart} label="Total Purchases" value={stats?.totalPurchases ?? 0} accent="bg-emerald-100 text-emerald-700" />
          <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} accent="bg-indigo-100 text-indigo-700" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ebook File</CardTitle>
              <CardDescription>Upload/replace the private PDF. Stored server-side only.</CardDescription>
            </div>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept="application/pdf" onChange={uploadPdf} className="hidden" />
              <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-1" />{uploading ? 'Uploading...' : 'Upload PDF'}
              </Button>
            </div>
          </CardHeader>
          {pdfInfo && <CardContent className="text-sm text-muted-foreground">Current PDF: <span className="font-medium text-foreground">{pdfInfo.pageCount} pages</span></CardContent>}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Sales Report</CardTitle><CardDescription>Export paid purchases as CSV</CardDescription></div>
            <a href="/api/admin/export.csv" target="_blank" rel="noreferrer"><Button variant="outline"><Download className="h-4 w-4 mr-1" />Export CSV</Button></a>
          </CardHeader>
        </Card>

        <Tabs defaultValue="purchases">
          <TabsList>
            <TabsTrigger value="purchases">Purchases ({purchases.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="purchases">
            <Card><CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Email</TableHead><TableHead>Order ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {purchases.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No purchases yet</TableCell></TableRow>}
                  {purchases.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.userName}</TableCell>
                      <TableCell>{p.userEmail}</TableCell>
                      <TableCell className="font-mono text-xs">{p.razorpayOrderId}</TableCell>
                      <TableCell>₹{(p.amount/100).toFixed(2)}</TableCell>
                      <TableCell><Badge variant={p.status === 'paid' ? 'default' : 'outline'} className={p.status === 'paid' ? 'bg-emerald-600' : ''}>{p.status}</Badge></TableCell>
                      <TableCell>{p.purchasedAt ? new Date(p.purchasedAt).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="users">
            <Card><CardContent className="pt-6 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Purchased</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell>{u.purchasedBook ? <Badge className="bg-emerald-600">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${accent}`}><Icon className="h-6 w-6" /></div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}
