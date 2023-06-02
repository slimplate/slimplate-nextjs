import BlogDisplay from './BlogDisplay.jsx'
import Content from '@slimplate/content'
import { MDXRemote } from 'next-mdx-remote/rsc'

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
        <BlogDisplay title={blog.title} date={blog.date}>
          <MDXRemote source={blog.children} />
        </BlogDisplay>
      </div>
    </div>
  )
}
