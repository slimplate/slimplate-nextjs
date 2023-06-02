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

  // TODO: check for logged in, otherwwise just return BlogDisplay

  return (
    <div className='drawer'>
      <input id='my-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <label htmlFor='my-drawer' className='btn btn-primary drawer-button'>Edit Page</label>
        <BlogDisplay {...blog} content={await serialize(blog.children)} />
      </div>
      <div className='drawer-side'>
        <label htmlFor='my-drawer' className='drawer-overlay' />
        <div className='menu p-4 w-80 h-full bg-base-200 text-base-content'>
          EDITOR HERE
        </div>
      </div>
    </div>
  )
}
