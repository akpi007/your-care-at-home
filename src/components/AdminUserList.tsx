import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "lucide-react";

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  professional: "bg-healthcare-soft-blue text-healthcare-blue",
  patient: "bg-healthcare-soft-green text-healthcare-green",
};

interface Props {
  users: any[];
}

const AdminUserList = ({ users }: Props) => {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead>Roles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{u.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.phone || "—"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {u.roles.map((r: string) => (
                      <Badge key={r} className={roleColors[r] ?? "bg-muted text-muted-foreground"}>
                        {r}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUserList;
