import { useEffect, useState } from 'react'
import dateFormat from 'dateformat'
import { useSlimplate } from '@slimplate/github'

const sorter = new Intl.Collator()

// simple app util to put blog posts in order and format the date-field
function fixDatesAndSort (posts) {
  const out = posts.sort((a, b) => sorter.compare(a.date, b.date)).reverse()
  return out.map(post => {
    return { ...post, date: dateFormat(post.date, 'longDate') }
  })
}

export default function ({ posts, collection }) {
  const [blogPosts, setBlogPosts] = useState(posts)
  const { getClientsideList } = useSlimplate(collection)

  useEffect(() => {
    getClientsideList().then(p => {
      setBlogPosts(fixDatesAndSort(p))
    })
  }, [collection])

  return (
    <main className='prose m-auto'>
      BLOG LIST GOES HERE
      <pre>{JSON.stringify(blogPosts, null, 2)}</pre>
      collection:
      <pre>{JSON.stringify(collection, null, 2)}</pre>
    </main>
  )
}

export async function getServerSideProps () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content('blog')
  const props = { posts: fixDatesAndSort(await content.list(true)), collection: content.collection }
  return { props }
}
