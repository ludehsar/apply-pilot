import { Show, UserButton } from "@clerk/chrome-extension"
import { Button } from "@workspace/ui/components/button"

export function Popup() {
  return (
    <main className="flex w-[360px] flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Apply Pilot</h1>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      {/* Sign-in happens on the web app; syncHost carries the session here. */}
      <Show when="signed-out">
        <p className="text-sm text-muted-foreground">
          Sign in on the web app to use the extension.
        </p>
        <Button asChild>
          <a
            href={`${import.meta.env.VITE_WEB_URL}/sign-in`}
            target="_blank"
            rel="noreferrer"
          >
            Sign in
          </a>
        </Button>
      </Show>
    </main>
  )
}
