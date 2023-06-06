import dateFormat from 'dateformat'

export default function ({ post, collection }) {
  return (
    <main className='prose m-auto'>
      <pre>{JSON.stringify(post, null, 2)}</pre>
      collection:
      <pre>{JSON.stringify(collection, null, 2)}</pre>
    </main>
  )
}

export async function getServerSideProps ({ query: { slug } }) {
  const Content = (await import('@slimplate/content')).default

  const content = new Content('blog')
  const props = { collection: content.collection }

  // find post with matching slug
  const posts = await content.list(true)
  for (const post of posts) {
    if (post.slug === slug) {
      post.date = dateFormat(post.date, 'longDate')
      props.post = post
      break
    }
  }

  return { props }
}
