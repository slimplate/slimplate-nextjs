import dateFormat from 'dateformat'

export default function ({ posts }) {
  return (
    <main className='prose m-auto'>
      BLOG LIST GOES HERE
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </main>
  )
}

const sorter = new Intl.Collator()

export async function getServerSideProps () {
  const { Content } = await import('@/common')
  const props = { posts: [] }

  const content = new Content('blog')
  const posts = (await content.list(true)).sort((a, b) => sorter.compare(a.date, b.date)).reverse()

  for (const post of await content.list(true)) {
    props.posts.push({
      title: post.title,
      slug: post.slug,
      date: dateFormat(post.date, 'longDate')
    })
  }
  return { props }
}
