"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User2, Mail, Calendar } from "lucide-react";

export default function AccountCard({ me }) {
  return (
    <Card className='md:col-span-1'>
      <CardHeader>
        <CardTitle className='text-lg'>Account</CardTitle>
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className='flex items-center gap-3'>
          <User2 className='h-4 w-4 text-muted-foreground' />
          <div>
            <div className='text-xs text-muted-foreground'>Name</div>
            <div className='font-medium'>{me.name}</div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Mail className='h-4 w-4 text-muted-foreground' />
          <div>
            <div className='text-xs text-muted-foreground'>Email</div>
            <div className='font-medium'>{me.email}</div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <div>
            <div className='text-xs text-muted-foreground'>Member since</div>
            <div className='font-medium'>
              {new Date(me.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
