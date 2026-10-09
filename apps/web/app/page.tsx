import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">Apply Pilot</span>
        <nav className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-start gap-4 p-6">
        <h1 className="text-xl font-semibold">Apply Pilot</h1>
        <p className="text-muted-foreground">
          Track every job application in one place.
        </p>
      </main>
    </div>
  )
}
