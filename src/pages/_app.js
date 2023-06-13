import Link from 'next/link'
import dynamic from 'next/dynamic'
import '@/styles/globals.css'

// forces this to update in client-side space
// sort of the equivilant of a modern client-side PureComponent
// https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading
const ButtonLoginDynamic = dynamic(
  async () => (await import('@slimplate/daisyui')).default,
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
