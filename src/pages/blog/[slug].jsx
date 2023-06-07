import { useEffect, useState } from 'react'
import { EditorPage } from '@slimplate/daisyui'
import Git from '@slimplate/github'
import s from '@/../.slimplate.json'
const { collections, repo } = s

// simple app util to find a post by slug, then format date
function findPostBySlug (slug, posts) {
  for (const post of posts) {
    if (post.slug === slug) {
      return post
    }
  }
  return null
}

export default function ({ post, collection, slug }) {
  const [blogPost, setBlogPost] = useState(post)

  // this pulls the client-side post
  useEffect(() => {
    const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: 'main' })
    git.init().then(async () => {
      if (git.updated) {
        const posts = await git.getAll()
        if (posts) {
          const p = findPostBySlug(slug, posts)
          if (p) {
            setBlogPost(p)
          }
        }
      }
    })
  }, [collection])

  return (
    <EditorPage item={blogPost} collection={collection}>
      <main className='prose m-auto'>
        server-side version:
        <pre>{JSON.stringify(blogPost, null, 2)}</pre>
        collection:
        <pre>{JSON.stringify(collection, null, 2)}</pre>
      </main>
    </EditorPage>
  )
}

export async function getStaticPaths () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog)
  const paths = (await content.list(true)).map(post => ({ params: { slug: post.slug } }))
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps ({ params: { slug } }) {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog, 'blog')
  const props = { slug, collection: collections.blog, post: findPostBySlug(slug, await content.list(true)) }
  return { props }
}
