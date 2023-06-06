import '@/styles/globals.css'
import { ButtonLogin } from '@slimplate/daisyui'

export default function App ({ Component, pageProps }) {
  return (
    <>
      <nav className='navbar bg-base-200 mb-4'>
        <a className='btn btn-ghost normal-case text-xl'>Slimplate Demo Site</a>
        <div className='ml-auto'>
          <ButtonLogin backendURL={process.env.NEXT_GITHUB_BACKEND} />
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  )
}
