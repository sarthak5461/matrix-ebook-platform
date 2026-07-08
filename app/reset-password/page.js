"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { resetPassword } from "@/services/auth.service";
function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success("Password updated!");
      router.push("/login");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader>
          <Link href='/' className='flex items-center gap-2 mb-2'>
            <div className='h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
              <BookOpen className='h-4 w-4 text-white' />
            </div>
            <span className='font-bold'>MatrixSA</span>
          </Link>
          <CardTitle className='text-2xl'>Reset password</CardTitle>
          <CardDescription>Choose a new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className='space-y-4'>
            <div>
              <Label>New password</Label>
              <Input
                type='password'
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className='w-full' disabled={loading || !token}>
              {loading ? "Updating..." : "Update password"}
            </Button>
            {!token && (
              <div className='text-xs text-red-600 text-center'>
                Missing token. Please use the link from your email.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
