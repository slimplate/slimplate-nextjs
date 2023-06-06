import Link from 'next/link'

export default function Home () {
  return (
    <main className='prose m-auto'>
      <h2>Welcome</h2>
      <p>Check out out <Link href='/blog'>blog</Link>.</p>
    </main>
  )
}
