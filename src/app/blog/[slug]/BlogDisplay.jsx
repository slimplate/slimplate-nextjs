'use client'
import { useState } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

const components = {}

// this is dummy now, but later on client-side it will output server-side (from files) or git on client-side
function useSlimplate (content, frontmatter) {
  const [source, setSource] = useState(content)

  return [source, s => {
    setSource(serialize(s))
  }]
}

export default function BlogDisplay ({ content, ...frontmatter }) {
  const [source, setSource] = useSlimplate(content, frontmatter)
  return (
    <div className='prose'>
      <h2>{frontmatter.title}</h2>
      <div className=''>
        <MDXRemote {...content} frontmatter={frontmatter} components={components} />
      </div>
    </div>
  )
}
