'use client'

import df from 'dateformat'

const sorter = new Intl.Collator()

export default function BlogList ({ items, collectionName }) {
  items.sort((a, b) => sorter.compare(a.date, b.date)).reverse()

  return (
    <ul>
      {items.map(i => (
        <li key={i.url}>
          <a href={i.url}>{i.title}</a> - <span className='text-xs'>{df(i.date, 'yyyy-mm-dd')}</span>
        </li>
      ))}
    </ul>
  )
}
