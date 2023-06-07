import { useEffect, useState } from 'react'
import dateFormat from 'dateformat'
import { EditorPage } from '@slimplate/daisyui'
import { useSlimplate } from '@slimplate/github'
import { collections, repo } from '@/../.slimplate.json'

// simple app util to find a post by slug, then format date
function findPostBySlugAndFixDate (slug, posts) {
  for (const post of posts) {
    if (post.slug === slug) {
      post.date = dateFormat(post.date, 'longDate')
      return post
    }
  }
  return null
}

export default function ({ post, collection, slug }) {
  const [blogPost, setBlogPost] = useState(post)
  const slimplate = useSlimplate(collection, repo, process.env.NEXT_PUBLIC_CORS_PROXY)

  // this pulls the client-side post
  useEffect(() => {
    slimplate.getClientsideList().then(posts => {
      if (posts) {
        const p = findPostBySlugAndFixDate(slug, posts)
        if (p) {
          setBlogPost(p)
        }
      }
    })
  }, [collection])

  return (
    <EditorPage item={blogPost} slimplate={slimplate}>
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
  const content = new Content(collections.blog, repo)
  const props = { slug, collection: collections.blog, post: findPostBySlugAndFixDate(slug, await content.list(true)) }
  return { props }
}
