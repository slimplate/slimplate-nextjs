'use client'

import { useSlimplateList } from '@slimplate/hooks'
import df from 'dateformat'

const sorter = new Intl.Collator()

export default function BlogList ({ items, collectionName }) {
  const blogs = useSlimplateList(items, collectionName)

  blogs.sort((a, b) => sorter.compare(a.date, b.date)).reverse()

  return (
    <ul>
      {blogs.map(i => (
        <li key={i.url}>
          <a href={i.url}>{i.title}</a> - <span className='text-xs'>{df(i.date, 'yyyy-mm-dd')}</span>
        </li>
      ))}
    </ul>
  )
}
