import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

export default function PurchasesTable({ purchases }) {
  return (
    <Card>
      <CardContent className='pt-6 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center text-muted-foreground py-6'
                >
                  No purchases yet
                </TableCell>
              </TableRow>
            )}
            {purchases.map((p) => (
              <TableRow key={p.id}>
                <TableCell className='font-medium'>{p.userName}</TableCell>
                <TableCell>{p.userEmail}</TableCell>
                <TableCell className='font-mono text-xs'>
                  {p.razorpayOrderId}
                </TableCell>
                <TableCell>₹{(p.amount / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "paid" ? "default" : "outline"}
                    className={p.status === "paid" ? "bg-emerald-600" : ""}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.purchasedAt
                    ? new Date(p.purchasedAt).toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
