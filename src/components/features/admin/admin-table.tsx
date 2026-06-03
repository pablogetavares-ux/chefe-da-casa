import { cn } from "@/lib/utils";

type AdminTableProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn("surface-card overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/50">{children}</tbody>;
}

export function AdminTr({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-muted/30">{children}</tr>;
}

export function AdminTd({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-3 align-middle", className)}>
      {children}
    </td>
  );
}
