import '@/styles/globals.css'
import { ButtonLogin } from '@slimplate/daisyui'

export default function App ({ Component, pageProps }) {
  return (
    <>
      <nav className='navbar bg-base-100'>
        <a className='btn btn-ghost normal-case text-xl'>Slimplate Demo Site</a>
        <div className='ml-auto'>
          <ButtonLogin />
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  )
}
