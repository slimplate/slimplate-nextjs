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
  const [status, setStatus] = useState(false)
  const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: branch || 'main' })

  // this pulls the client-side list of posts
  useEffect(() => {
    if (!user) {
      return
    }
    git.init().then(async () => {
      if (git.updated) {
        const posts = await git.getAllItems()
        setStatus(await git.getProjectStatus())
        if (posts) {
          setBlogPosts(sortPosts(posts))
        }
      }
    })
  }, [collection, user, posts])

  useEffect(() => {
    if (!user) {
      return
    }
    setStatus(false)

    git.init().then(async () => {
      if (git.updated) {
        setStatus(await git.getProjectStatus())
      }
    })
  }, [blogPosts])

  const getStatusClass = (filename) => {
    if (status?.addedFiles?.includes(filename) || status?.modifiedFiles?.includes(filename)) {
      return 'marker:text-blue-500'
    } else {
      return 'marker:text-green-500'
    }
  }

  return (
    <>
      <Head>
        <title>Blog</title>
      </Head>
      <EditorPage
        showSync
        status={status}
        repo={repo}
        collection={collection}
        branch={branch || 'main'}
        proxy={process.env.NEXT_PUBLIC_CORS_PROXY}
        onUpdate={post => setBlogPosts(sortPosts([...blogPosts, post]))}
      >
        <main className='prose m-auto'>
          <h3>Blog</h3>
          <ul>
            {blogPosts.map(post => (
              <li className={getStatusClass(post.filename.substring(1))} key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link> - <small>{dateFormat(post.date, 'longDate')}</small>
              </li>
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
