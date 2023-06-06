import Link from 'next/link'
import { ButtonLogin } from '@slimplate/daisyui'
import '@/styles/globals.css'

export default function App ({ Component, pageProps }) {
  return (
    <>
      <nav className='navbar bg-base-200 mb-4'>
        <Link className='btn btn-ghost normal-case text-xl' href='/'>Slimplate Demo Site</Link>
        <div className='ml-auto'>
          <ButtonLogin backendURL={process.env.NEXT_GITHUB_BACKEND} />
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  )
}
