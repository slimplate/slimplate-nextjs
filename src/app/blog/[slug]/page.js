import BlogDisplay from './BlogDisplay.jsx'
import Content from '@slimplate/content'
import { serialize } from 'next-mdx-remote/serialize'

export default async function PageSlug ({ params: { slug } }) {
  const content = new Content('blog')
  const items = await content.list(true)
  const blog = items.find(b => b.slug === slug)

  if (!blog) {
    return (
      <div>NOT FOUND</div>
    )
  }

  return (
    <div className='prose'>
      <div className=''>
        <BlogDisplay {...blog} content={await serialize(blog.children)} />
      </div>
    </div>
  )
}
