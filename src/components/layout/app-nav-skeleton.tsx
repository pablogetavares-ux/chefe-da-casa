export function AppNavSkeleton() {
  return (
    <>
      <aside
        aria-hidden
        className="hidden md:flex md:min-h-full md:w-64 md:flex-col md:border-r md:bg-sidebar"
      >
        <div className="border-b border-sidebar-border p-5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-muted/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-28 rounded bg-muted/60" />
              <div className="h-3 w-36 rounded bg-muted/40" />
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-10 rounded-xl bg-muted/30" />
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-muted/60" />
          <div className="h-4 w-24 rounded bg-muted/60" />
        </div>
        <div className="flex gap-1">
          <div className="size-8 rounded-md bg-muted/40" />
          <div className="size-8 rounded-md bg-muted/40" />
        </div>
      </header>

      <nav
        aria-hidden
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="flex justify-around px-1 py-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="size-10 rounded-xl bg-muted/30" />
          ))}
        </div>
      </nav>
    </>
  );
}
