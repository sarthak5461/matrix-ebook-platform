import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ExportCard() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>Export paid purchases as CSV</CardDescription>
        </div>
        <a href='/api/admin/export.csv' target='_blank' rel='noreferrer'>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-1' />
            Export CSV
          </Button>
        </a>
      </CardHeader>
    </Card>
  );
}
