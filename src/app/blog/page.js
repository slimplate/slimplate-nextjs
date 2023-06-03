import BlogList from './BlogList.jsx'
import Content from '@slimplate/content'

export default async function BlogLayout () {
  const content = new Content('blog')
  const items = await content.list(true)

  return (
    <main>
      <div className='prose'>
        <h3>This is blog</h3>
        <BlogList items={items} collectionName='blog' />
      </div>
    </main>
  )
}
