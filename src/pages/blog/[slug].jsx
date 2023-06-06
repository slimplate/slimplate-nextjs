import { useEffect, useState } from 'react'
import dateFormat from 'dateformat'
import { EditorPage } from '@slimplate/daisyui'
import { useSlimplate } from '@slimplate/github'

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
  const { getClientsideList } = useSlimplate(collection)

  // this pulls the client-side post
  useEffect(() => {
    getClientsideList().then(posts => {
      if (posts) {
        const p = findPostBySlugAndFixDate(slug, posts)
        if (p) {
          setBlogPost(p)
        }
      }
    })
  }, [collection])

  return (
    <EditorPage item={blogPost}>
      <main className='prose m-auto'>
        <pre>{JSON.stringify(blogPost, null, 2)}</pre>
        collection:
        <pre>{JSON.stringify(collection, null, 2)}</pre>
      </main>
    </EditorPage>
  )
}

export async function getServerSideProps ({ query: { slug } }) {
  // this pulls the server-side post
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content('blog')
  const props = { slug, collection: content.collection, post: findPostBySlugAndFixDate(slug, await content.list(true)) }
  return { props }
}
