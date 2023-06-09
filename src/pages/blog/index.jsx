import { useEffect, useState } from 'react'
import Link from 'next/link'
import dateFormat from 'dateformat'
import Head from 'next/head'
import Git from '@slimplate/github'
import s from '@/../.slimplate.json'
import { EditorPage } from '@slimplate/daisyui'
import { useLocalStorage } from '@slimplate/utils'
const { collections, repo, branch } = s

const sorter = new Intl.Collator()

// simple app util to put blog posts in order and format the date-field
function sortPosts (posts) {
  const out = posts.sort((a, b) => sorter.compare(a.date, b.date))
  out.reverse()
  return out
}

export default function ({ posts, collection }) {
  const [blogPosts, setBlogPosts] = useState(posts)
  const [user] = useLocalStorage('user', false)

  // this pulls the client-side list of posts
  useEffect(() => {
    if (!user) {
      return
    }
    const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: branch || 'main' })
    git.init().then(async () => {
      if (git.updated) {
        const posts = await git.getAllItems()
        if (posts) {
          setBlogPosts(sortPosts(posts))
        }
      }
    })
  }, [collection, user])

  return (
    <>
      <Head>
        <title>Blog</title>
      </Head>
      <EditorPage
        repo={repo}
        collection={collection}
        branch={branch || 'main'}
        proxy={process.env.NEXT_PUBLIC_CORS_PROXY}
        onUpdate={post => setBlogPosts(sortPosts([...posts, post]))}
      >
        <main className='prose m-auto'>
          <h3>Blog</h3>
          <ul>
            {blogPosts.map(post => (
              <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link> - <small>{dateFormat(post.date, 'longDate')}</small></li>
            ))}
          </ul>
        </main>
      </EditorPage>
    </>
  )
}

export async function getStaticProps () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog, 'blog')
  const props = { posts: sortPosts(await content.list(true)), collection: collections.blog }
  return { props }
}
