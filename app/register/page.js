"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function Register() {
  console.log("Register component rendered");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Registration failed");
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-1'>
          <Link href='/' className='flex items-center gap-2 mb-2'>
            <div className='h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center'>
              <BookOpen className='h-4 w-4 text-white' />
            </div>
            <span className='font-bold'>MatrixSA</span>
          </Link>
          <CardTitle className='text-2xl'>Create account</CardTitle>
          <CardDescription>Register to buy and read the ebook</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className='space-y-4'>
            <div>
              <Label>Full name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type='email'
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type='password'
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <Button className='w-full' disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
            <div className='text-center text-sm text-muted-foreground'>
              Have an account?{" "}
              <Link href='/login' className='text-indigo-600 hover:underline'>
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
