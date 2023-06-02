'use client'

export default function BlogList ({ items }) {
  console.log(items)
  return (
    <ul>
      {items.map(i => (<li key={i.url}><a href={i.url}>{i.title}</a></li>))}
    </ul>
  )
}
