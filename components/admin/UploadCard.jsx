import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function UploadCard({ uploading, fileRef, uploadPdf, pdfInfo }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Ebook File</CardTitle>
          <CardDescription>
            Upload/replace the private PDF. Stored server-side only.
          </CardDescription>
        </div>
        <div className='flex gap-2'>
          <input
            ref={fileRef}
            type='file'
            accept='application/pdf'
            onChange={uploadPdf}
            className='hidden'
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className='h-4 w-4 mr-1' />
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </CardHeader>
      {pdfInfo && (
        <CardContent className='text-sm text-muted-foreground'>
          Current PDF:{" "}
          <span className='font-medium text-foreground'>
            {pdfInfo.pageCount} pages
          </span>
        </CardContent>
      )}
    </Card>
  );
}
