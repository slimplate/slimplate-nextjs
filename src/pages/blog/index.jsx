import { useEffect, useState } from 'react'
import Link from 'next/link'
import dateFormat from 'dateformat'
import { useSlimplate } from '@slimplate/github'

const sorter = new Intl.Collator()

// simple app util to put blog posts in order and format the date-field
function fixDatesAndSort (posts) {
  const out = posts.sort((a, b) => sorter.compare(a.date, b.date))
  out.reverse()
  return out.map(post => {
    return { ...post, date: dateFormat(post.date, 'longDate') }
  })
}

export default function ({ posts, collection }) {
  const [blogPosts, setBlogPosts] = useState(posts)
  const { getClientsideList } = useSlimplate(collection, process.env.NEXT_PUBLIC_CORS_PROXY)

  useEffect(() => {
    getClientsideList().then(p => {
      if (p) {
        setBlogPosts(fixDatesAndSort(p))
      }
    })
  }, [collection])

  return (
    <main className='prose m-auto'>
      <h3>Blog</h3>
      <ul>
        {blogPosts.map(post => (
          <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link> - <small>{post.date}</small></li>
        ))}
      </ul>
    </main>
  )
}

export async function getServerSideProps () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content('blog')
  const props = { posts: fixDatesAndSort(await content.list(true)), collection: content.collection }
  return { props }
}
