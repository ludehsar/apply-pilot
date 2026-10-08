import { Button } from "@workspace/ui/components/button"

export function Popup() {
  return (
    <main className="flex w-[360px] flex-col gap-4 p-4">
      <h1 className="text-base font-semibold">Apply Pilot</h1>
      <Button>Get started</Button>
    </main>
  )
}
