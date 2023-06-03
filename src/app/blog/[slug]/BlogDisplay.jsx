'use client'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useSlimplateItem } from '@slimplate/hooks'

const components = {}

export default function BlogDisplay ({ content, ...frontmatter }) {
  const [source, setSource] = useSlimplateItem(content, frontmatter)
  return (
    <div className='prose'>
      <h2>{frontmatter.title}</h2>
      <div className=''>
        <MDXRemote {...content} frontmatter={frontmatter} components={components} />
      </div>
    </div>
  )
}
