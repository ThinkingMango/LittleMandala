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
 * Unmounting and calling this again is leaving the screen or reloading: only what reached storage comes back.
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

type User = ReturnType<typeof userEvent.setup>

const region = (name: string) => screen.getByRole('button', { name })
const tool = (name: string) => screen.getByRole('button', { name })

function storedDraftFills() {
  const artworks = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.artworks) ?? '{}')
  const drafts = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.drafts) ?? '{}')
  return artworks[drafts.sunny]?.fills
}

const THREE_COLORS = { 'l0-p0': 'red', 'l0-p1': 'blue', center: 'blue' }

async function colorThreeRegions(user: User) {
  await user.click(region('Petal 1'))
  await user.click(screen.getByRole('radio', { name: 'Blue' }))
  await user.click(region('Petal 2'))
  await user.click(region('Flower center'))
}

async function startOver(user: User) {
  await user.click(tool('Start over'))
  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByRole('button', { name: 'Yes, start over' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
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

  it('cannot start over, undo, or redo on a flower that has no color yet', () => {
    openColoringPage()
    expect(tool('Start over')).toBeDisabled()
    expect(tool('Undo')).toBeDisabled()
    expect(tool('Redo')).toBeDisabled()
  })

  it('shows a colored-to-blank preview and keeps everything when the cross is tapped', async () => {
    const { user } = openColoringPage()
    await colorThreeRegions(user)

    await user.click(tool('Start over'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('img', { name: /colored flower will turn all white/i })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'No, keep my colors' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(storedDraftFills()).toEqual(THREE_COLORS)
  })

  it('starts over on the check, and one undo brings every color back, and redo clears again', async () => {
    const { user } = openColoringPage()
    await colorThreeRegions(user)
    await startOver(user)

    expect(region('Petal 1')).toBeInTheDocument()
    expect(storedDraftFills()).toEqual({})

    await user.click(tool('Undo'))
    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(region('Flower center, Blue')).toBeInTheDocument()
    expect(storedDraftFills()).toEqual(THREE_COLORS)

    await user.click(tool('Redo'))
    expect(region('Flower center')).toBeInTheDocument()
    expect(storedDraftFills()).toEqual({})
    expect(tool('Redo')).toBeDisabled()
  })

  it('keeps undo and redo after the child leaves the screen and comes back', async () => {
    const first = openColoringPage()
    await colorThreeRegions(first.user)
    await startOver(first.user)
    first.unmount()

    const second = openColoringPage()
    expect(region('Petal 1')).toBeInTheDocument()
    expect(tool('Undo')).toBeEnabled()
    await second.user.click(tool('Undo'))
    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(region('Petal 2, Blue')).toBeInTheDocument()
    second.unmount()

    const third = openColoringPage()
    expect(region('Petal 1, Red')).toBeInTheDocument()
    await third.user.click(tool('Redo'))
    expect(region('Petal 1')).toBeInTheDocument()
  })

  it('a new tap after undo drops what could be redone', async () => {
    const { user } = openColoringPage()
    await colorThreeRegions(user)
    await user.click(tool('Undo'))
    expect(tool('Redo')).toBeEnabled()

    await user.click(region('Petal 3'))
    expect(tool('Redo')).toBeDisabled()
  })

  it('erases a single part with the eraser, and undo and redo work on it', async () => {
    const first = openColoringPage()
    await colorThreeRegions(first.user)

    await first.user.click(screen.getByRole('radio', { name: 'Eraser' }))
    await first.user.click(region('Petal 2, Blue'))
    expect(region('Petal 2')).toBeInTheDocument()
    expect(region('Petal 1, Red')).toBeInTheDocument()
    expect(storedDraftFills()).toEqual({ 'l0-p0': 'red', center: 'blue' })

    await first.user.click(tool('Undo'))
    expect(region('Petal 2, Blue')).toBeInTheDocument()
    await first.user.click(tool('Redo'))
    expect(region('Petal 2')).toBeInTheDocument()
    first.unmount()

    openColoringPage()
    expect(region('Petal 2')).toBeInTheDocument()
    expect(region('Flower center, Blue')).toBeInTheDocument()
  })

  it('does not start an artwork when the eraser taps a blank flower', async () => {
    const { user, library } = openColoringPage()
    await user.click(screen.getByRole('radio', { name: 'Eraser' }))
    await user.click(region('Petal 1'))

    expect(library.getState().artworks).toEqual({})
    expect(tool('Undo')).toBeDisabled()
  })

  it('saves to the garden only when the child taps done, not while autosaving', async () => {
    const { user, library } = openColoringPage()
    await colorThreeRegions(user)
    expect(library.getState().gallery).toHaveLength(0)

    await user.click(tool("I'm done"))
    expect(library.getState().gallery).toHaveLength(1)
  })

  it('protects the garden picture when the child keeps going and starts over', async () => {
    const { user, library } = openColoringPage()
    await colorThreeRegions(user)
    await user.click(tool("I'm done"))
    await user.click(await screen.findByRole('button', { name: 'Keep going' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await startOver(user)
    await user.click(tool('Undo'))
    await user.click(tool('Redo'))

    const [saved] = library.getState().gallery
    expect(saved.fills).toEqual(THREE_COLORS)
    expect(library.getDraft('sunny')?.id).not.toBe(saved.id)
    expect(storedDraftFills()).toEqual({})
  })
})
