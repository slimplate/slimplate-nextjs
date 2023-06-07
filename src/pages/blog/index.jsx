import { useEffect, useState } from 'react'
import Link from 'next/link'
import dateFormat from 'dateformat'
import Git from '@slimplate/github'
import { repo, collections } from '@/../.slimplate.json'

const sorter = new Intl.Collator()

// simple app util to put blog posts in order and format the date-field
function sortPosts (posts) {
  const out = posts.sort((a, b) => sorter.compare(a.date, b.date))
  out.reverse()
  return out
}

export default function ({ posts, collection }) {
  const [blogPosts, setBlogPosts] = useState(posts)
  const git = new Git(collection, repo, process.env.NEXT_PUBLIC_CORS_PROXY)

  useEffect(() => {
    git.getAll().then(p => {
      if (p) {
        setBlogPosts(sortPosts(p))
      }
    })
  }, [collection])

  return (
    <main className='prose m-auto'>
      <h3>Blog</h3>
      <ul>
        {blogPosts.map(post => (
          <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link> - <small>{dateFormat(post.date, 'longDate')}</small></li>
        ))}
      </ul>
    </main>
  )
}

export async function getStaticProps () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog, 'blog')
  const props = { posts: sortPosts(await content.list(true)), collection: collections.blog }
  return { props }
}
