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
    expect(screen.getByRole('link', { name: /^Trihuni Catalog/ })).toHaveAttribute('href', '/properti')
    expect(screen.getByRole('link', { name: /^Kunjungi Kerjasama/ })).toHaveAttribute('href', '/kerjasama')
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

describe('Navbar dropdown UX', () => {
  it('keeps a dropdown open when its trigger is clicked again, as on hover-then-click', () => {
    renderAt('/properti')
    const trigger = screen.getByRole('button', { name: 'Produk Trihuni' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('shows the pointer cursor on every trigger', () => {
    renderAt('/properti')
    for (const name of ['Produk Trihuni', 'Trihuni Corp', 'Tentang Trihuni']) {
      expect(screen.getByRole('button', { name }).className).toContain('cursor-pointer')
    }
  })

  it('gives every item a one-line description under its label', () => {
    renderAt('/properti')
    fireEvent.click(screen.getByRole('button', { name: 'Produk Trihuni' }))
    const catalog = screen.getByRole('link', { name: /Trihuni Catalog/ })
    expect(catalog).toHaveTextContent('Rumah, apartemen, tanah, dan ruko')
  })

  it('dims the page behind an open dropdown, and only then', () => {
    const { container } = renderAt('/properti')
    expect(container.querySelector('[data-nav-overlay]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Trihuni Corp' }))
    expect(container.querySelector('[data-nav-overlay]')).not.toBeNull()
  })
})

describe('Navbar surface', () => {
  it('is transparent over the homepage hero, with light text', () => {
    document.body.innerHTML = ''
    const heroEl = document.createElement('section')
    heroEl.id = 'home'
    heroEl.getBoundingClientRect = () => ({ bottom: 600 }) as DOMRect
    document.body.appendChild(heroEl)
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
