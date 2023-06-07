import { useEffect, useState } from 'react'
import Link from 'next/link'
import dateFormat from 'dateformat'
import Git from '@slimplate/github'
import s from '@/../.slimplate.json'
import { EditorPage } from '@slimplate/daisyui'
const { collections, repo } = s

const sorter = new Intl.Collator()

// simple app util to put blog posts in order and format the date-field
function sortPosts (posts) {
  const out = posts.sort((a, b) => sorter.compare(a.date, b.date))
  out.reverse()
  return out
}

export default function ({ posts, collection }) {
  const [blogPosts, setBlogPosts] = useState(posts)

  // this pulls the client-side list of posts
  useEffect(() => {
    const git = new Git(collection, repo, process.env.NEXT_PUBLIC_CORS_PROXY)
    git.init().then(async () => {
      if (git.updated) {
        const posts = await git.getAll()
        if (posts) {
          setBlogPosts(sortPosts(posts))
        }
      }
    })
  }, [collection])

  return (
    <EditorPage collection={collection}>
      <main className='prose m-auto'>
        <h3>Blog</h3>
        <ul>
          {blogPosts.map(post => (
            <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link> - <small>{dateFormat(post.date, 'longDate')}</small></li>
          ))}
        </ul>
      </main>
    </EditorPage>
  )
}

export async function getStaticProps () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog, 'blog')
  const props = { posts: sortPosts(await content.list(true)), collection: collections.blog }
  return { props }
}
