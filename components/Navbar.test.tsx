import { render } from '@testing-library/react'
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

describe('Navbar active link', () => {
  it('marks only Home active on the homepage before a section is observed', () => {
    const { container } = renderAt('/')
    expect(activeNavIds(container)).toEqual(['home'])
  })

  it('marks only Listings active on the catalog', () => {
    const { container } = renderAt('/properti')
    expect(activeNavIds(container)).toEqual(['listings'])
  })

  it('marks only Listings active on the map view', () => {
    const { container } = renderAt('/peta')
    expect(activeNavIds(container)).toEqual(['listings'])
  })

  it('marks only Agen active on the agent index', () => {
    const { container } = renderAt('/agen')
    expect(activeNavIds(container)).toEqual(['agents'])
  })

  it('marks only Agen active on an agent profile', () => {
    const { container } = renderAt('/agen/a1')
    expect(activeNavIds(container)).toEqual(['agents'])
  })

  it('renders a link to the agent index', () => {
    const { container } = renderAt('/')
    const agen = container.querySelector('[data-nav="agents"]')
    expect(agen).toHaveAttribute('href', '/agen')
  })
})
