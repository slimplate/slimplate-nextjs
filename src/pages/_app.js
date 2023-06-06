import Link from 'next/link'
import dynamic from 'next/dynamic'

import '@/styles/globals.css'

const ButtonLoginDynamic = dynamic(
  async () => (await import('@slimplate/daisyui')).ButtonLogin,
  { ssr: false }
)

export default function App ({ Component, pageProps }) {
  return (
    <>
      <nav className='navbar bg-base-200 mb-4'>
        <Link className='btn btn-ghost normal-case text-xl' href='/'>Slimplate Demo Site</Link>
        <div className='ml-auto'>
          <ButtonLoginDynamic backendURL={process.env.NEXT_PUBLIC_GITHUB_BACKEND} />
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  )
}
