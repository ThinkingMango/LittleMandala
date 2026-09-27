import type { ReactNode } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColoringScreen } from '@/components/coloring/coloring-screen'
import { ArtworkLibraryProvider } from '@/hooks/use-artwork-library'
import { STORAGE_KEYS, createArtworkLibrary } from '@/lib/artwork/library'
import { getMandala, templates } from '@/lib/mandalas'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const sunny = getMandala('sunny')!

/**
 * Mounts the real coloring screen against real localStorage with a brand-new library instance.
 * Unmounting and calling this again is a page reload: only what reached storage comes back.
 */
function openColoringPage() {
  const library = createArtworkLibrary({ storage: () => window.localStorage, templates })
  const user = userEvent.setup()
  const view = render(
    <ArtworkLibraryProvider value={library}>
      <ColoringScreen mandala={sunny} />
    </ArtworkLibraryProvider>,
  )
  return { user, library, ...view }
}

const region = (name: string) => screen.getByRole('button', { name })

function storedFills() {
  const artworks = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.artworks) ?? '{}')
  const drafts = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.drafts) ?? '{}')
  return artworks[drafts.sunny]?.fills
}

async function colorThreeRegions(user: ReturnType<typeof userEvent.setup>) {
  await user.click(region('Petal 1'))
  await user.click(screen.getByRole('radio', { name: 'Blue' }))
  await user.click(region('Petal 2'))
  await user.click(region('Flower center'))
}

async function openClearDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  return screen.findByRole('dialog')
}

describe('coloring screen', () => {
  it('restores every color after a reload', async () => {
    const first = openColoringPage()
    await colorThreeRegions(first.user)
    first.unmount()

    openColoringPage()
    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(region('Petal 2, Blue')).toBeInTheDocument()
    expect(region('Flower center, Blue')).toBeInTheDocument()
    expect(region('Petal 3')).toBeInTheDocument()
  })

  it('cannot clear a flower that has no color yet', () => {
    openColoringPage()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('shows a colored-to-blank preview and keeps everything when the cross is tapped', async () => {
    const { user } = openColoringPage()
    await colorThreeRegions(user)

    const dialog = await openClearDialog(user)
    expect(within(dialog).getByRole('img', { name: /colored flower will turn all white/i })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'No, keep my colors' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(storedFills()).toEqual({ 'l0-p0': 'red', 'l0-p1': 'blue', center: 'blue' })
  })

  it('clears to blank on the check, saves the blank, and one undo brings every color back', async () => {
    const { user, unmount } = openColoringPage()
    await colorThreeRegions(user)

    const dialog = await openClearDialog(user)
    await user.click(within(dialog).getByRole('button', { name: 'Yes, clear it' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(region('Petal 1')).toBeInTheDocument()
    expect(region('Flower center')).toBeInTheDocument()
    expect(storedFills()).toEqual({})

    await user.click(screen.getByRole('button', { name: 'Undo' }))

    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(region('Petal 2, Blue')).toBeInTheDocument()
    expect(region('Flower center, Blue')).toBeInTheDocument()
    expect(storedFills()).toEqual({ 'l0-p0': 'red', 'l0-p1': 'blue', center: 'blue' })

    unmount()
    openColoringPage()
    expect(region('Flower center, Blue')).toBeInTheDocument()
  })

  it('keeps a confirmed clear after a reload', async () => {
    const first = openColoringPage()
    await colorThreeRegions(first.user)
    const dialog = await openClearDialog(first.user)
    await first.user.click(within(dialog).getByRole('button', { name: 'Yes, clear it' }))
    first.unmount()

    openColoringPage()
    expect(region('Petal 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('saves to the garden only when the child taps done, not while autosaving', async () => {
    const { user, library } = openColoringPage()
    await colorThreeRegions(user)
    expect(library.getState().gallery).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: "I'm done" }))
    expect(library.getState().gallery).toHaveLength(1)
  })
})
