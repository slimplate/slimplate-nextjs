import Content from '@slimplate/content'
import { serialize } from 'next-mdx-remote/serialize'
import DaisyEditorPage from '@slimplate/DaisyEditorPage'
import BlogDisplay from './BlogDisplay.jsx'

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
    <DaisyEditorPage item={blog}>
      <BlogDisplay {...blog} content={await serialize(blog.children)} />
    </DaisyEditorPage>
  )
}
