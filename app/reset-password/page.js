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
import { Eye, EyeOff } from "lucide-react";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
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
              <Label>New Password</Label>

              <div className='relative'>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pr-10'
                />

                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>

              <div className='relative'>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='pr-10'
                />

                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
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
