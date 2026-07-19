import { Button } from "@/components/ui/button";
import { FlaskConicalIcon } from "lucide-react";

// Seeded by server/prisma/seed.ts. Kept in sync manually — if you change the
// demo user there, change it here too.
export const DEMO_CREDENTIALS = {
  email: "demo@pomodoro.test",
  password: "DemoPomodoro@2026",
} as const;

export function DemoCredentials({
  onUse,
}: {
  onUse?: (credentials: typeof DEMO_CREDENTIALS) => void;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <FlaskConicalIcon className="size-4" />
        Try it without signing up
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
        <dt>Email</dt>
        <dd className="font-mono text-foreground">{DEMO_CREDENTIALS.email}</dd>
        <dt>Password</dt>
        <dd className="font-mono text-foreground">
          {DEMO_CREDENTIALS.password}
        </dd>
      </dl>
      {onUse && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onUse(DEMO_CREDENTIALS)}
        >
          Fill demo credentials
        </Button>
      )}
    </div>
  );
}
