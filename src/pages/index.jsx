import Link from 'next/link'
import Head from 'next/head'

export default function Home () {
  return (
    <>
      <Head>
        <title>Slimplate Demo Site</title>
      </Head>
      <main className='prose m-auto'>
        <h2>Welcome</h2>
        <p>Check out out <Link href='/blog'>blog</Link>.</p>
      </main>
    </>
  )
}
