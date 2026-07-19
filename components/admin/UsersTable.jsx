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

export default function UsersTable({ users }) {
  return (
    <Card>
      <CardContent className='pt-6 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Purchased</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className='font-medium'>{u.name}</TableCell>

                <TableCell>{u.email}</TableCell>

                <TableCell>
                  <Badge variant='outline'>{u.role}</Badge>
                </TableCell>

                <TableCell>
                  {u.purchasedBook ? (
                    <Badge className='bg-emerald-600'>Yes</Badge>
                  ) : (
                    <Badge variant='outline'>No</Badge>
                  )}
                </TableCell>

                <TableCell>
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
