'use client'

import { useSlimplateList } from '@slimplate/hooks'

export default function BlogList ({ items, collectionName }) {
  const blogs = useSlimplateList(items, collectionName)
  return (
    <ul>
      {blogs.map(i => (<li key={i.url}><a href={i.url}>{i.title}</a></li>))}
    </ul>
  )
}
