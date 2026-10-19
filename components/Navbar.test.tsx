import { render, screen, fireEvent, within } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Navbar from '@/components/Navbar'

let mockPathname = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

function activeNavIds(container: HTMLElement) {
  return [...container.querySelectorAll('[data-nav]')]
    .filter((el) => el.className.includes('font-bold'))
    .map((el) => el.getAttribute('data-nav'))
}

function renderAt(pathname: string) {
  mockPathname = pathname
  return render(
    <SessionProvider>
      <Navbar />
    </SessionProvider>,
  )
}

describe('Navbar dropdowns', () => {
  it('shows the three dropdowns from the brief', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    for (const label of ['Produk Trihuni', 'Trihuni Corp', 'Tentang Trihuni']) {
      expect(within(nav).getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('opens a dropdown on click and lists its items with their links', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: 'Produk Trihuni' }))
    expect(screen.getByRole('link', { name: 'Trihuni Catalog' })).toHaveAttribute('href', '/properti')
    expect(screen.getByRole('link', { name: 'Kunjungi Kerjasama' })).toHaveAttribute('href', '/kerjasama')
  })

  it('marks nothing on the homepage before a section is observed', () => {
    expect(activeNavIds(renderAt('/').container)).toEqual([])
  })

  it('marks Produk Trihuni on the catalog', () => {
    expect(activeNavIds(renderAt('/properti').container)).toEqual(['produk'])
  })

  it('marks Produk Trihuni on a listing page', () => {
    expect(activeNavIds(renderAt('/properti/abc').container)).toEqual(['produk'])
  })

  it('marks Trihuni Corp on a coming-soon page of its own', () => {
    expect(activeNavIds(renderAt('/hub').container)).toEqual(['corp'])
  })

  it('marks nothing on the agent pages, which are no longer in the navbar', () => {
    expect(activeNavIds(renderAt('/agen').container)).toEqual([])
  })
})

describe('Mobile menu', () => {
  it('groups every item under its dropdown heading', () => {
    renderAt('/tentang')
    fireEvent.click(screen.getByRole('button', { name: 'Buka menu navigasi' }))
    const dialog = screen.getByRole('dialog')
    for (const label of ['Produk Trihuni', 'Trihuni Corp', 'Tentang Trihuni']) {
      expect(within(dialog).getByRole('heading', { name: label })).toBeInTheDocument()
    }
    expect(within(dialog).getByRole('link', { name: 'Kontak Kami' })).toHaveAttribute('href', '/#contact')
    expect(within(dialog).getByRole('link', { name: 'Tentang Kami' })).toHaveAttribute('aria-current', 'page')
    expect(within(dialog).getByRole('link', { name: 'For Business' })).not.toHaveAttribute('aria-current')
  })
})

describe('Navbar surface', () => {
  it('is transparent over the homepage hero, with light text', () => {
    const { container } = renderAt('/')
    const header = container.querySelector('header')!
    expect(header.className).toContain('bg-transparent')
    expect(screen.getByRole('button', { name: 'Produk Trihuni' }).className).toContain('text-white')
  })

  it('is solid on every other page', () => {
    const { container } = renderAt('/properti')
    const header = container.querySelector('header')!
    expect(header.className).toContain('bg-background')
    expect(header.className).not.toContain('bg-transparent')
  })

  it('shows a pill sign-in link when signed out', () => {
    const { getAllByRole } = renderAt('/properti')
    const masuk = getAllByRole('link', { name: /masuk/i })[0]
    expect(masuk).toHaveAttribute('href', '/masuk')
    expect(masuk.className).toContain('rounded-full')
  })
})
