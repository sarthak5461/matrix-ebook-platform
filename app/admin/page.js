"use client";
import { useRef, useState } from "react";
import { uploadPdf as uploadPdfService } from "@/services/admin.service";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import UploadCard from "@/components/admin/UploadCard";
import ExportCard from "@/components/admin/ExportCard";
import UsersTable from "@/components/admin/UsersTable";
import PurchasesTable from "@/components/admin/PurchasesTable";
import AdminHeader from "@/components/admin/AdminHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, ShoppingCart, IndianRupee, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminPage() {
  const router = useRouter();
  const { me, loading } = useAuth();
  const {
    stats,
    users,
    purchases,
    loading: adminLoading,
    loadAll,
  } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const fileRef = useRef(null);

  const uploadPdf = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files allowed");
      return;
    }
    setUploading(true);
    try {
      const data = await uploadPdfService(file);
      setPdfInfo(data);
      toast.success(`Uploaded! ${data.pageCount} pages`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  };

  if (loading || adminLoading)
    return (
      <div className='min-h-screen flex items-center justify-center text-muted-foreground'>
        Loading admin...
      </div>
    );

  return (
    <div className='min-h-screen bg-slate-50'>
      <AdminHeader onLogout={logout} />
      <main className='container py-10 space-y-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
            <p className='text-muted-foreground'>
              Users, purchases, revenue & ebook management
            </p>
          </div>
          <Button variant='outline' size='sm' onClick={loadAll}>
            <RefreshCw className='h-4 w-4 mr-1' />
            Refresh
          </Button>
        </div>

        <div className='grid md:grid-cols-3 gap-5'>
          <StatsCard
            icon={Users}
            label='Total Users'
            value={stats?.totalUsers ?? 0}
            accent='bg-blue-100 text-blue-700'
          />
          <StatsCard
            icon={ShoppingCart}
            label='Total Purchases'
            value={stats?.totalPurchases ?? 0}
            accent='bg-emerald-100 text-emerald-700'
          />
          <StatsCard
            icon={IndianRupee}
            label='Total Revenue'
            value={`₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
            accent='bg-indigo-100 text-indigo-700'
          />
        </div>
        <UploadCard
          uploading={uploading}
          fileRef={fileRef}
          uploadPdf={uploadPdf}
          pdfInfo={pdfInfo}
        />

        <ExportCard />

        <Tabs defaultValue='purchases'>
          <TabsList>
            <TabsTrigger value='purchases'>
              Purchases ({purchases.length})
            </TabsTrigger>
            <TabsTrigger value='users'>Users ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value='purchases'>
            <PurchasesTable purchases={purchases} />
          </TabsContent>

          <TabsContent value='users'>
            <UsersTable users={users} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
