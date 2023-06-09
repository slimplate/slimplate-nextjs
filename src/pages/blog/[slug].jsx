import { useEffect, useState } from 'react'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Head from 'next/head'
import { EditorPage } from '@slimplate/daisyui'
import Git from '@slimplate/github'
import { useLocalStorage } from '@slimplate/utils'

import s from '@/../.slimplate.json'
const { collections, repo, branch } = s

// needed because of bug: https://github.com/hashicorp/next-mdx-remote/issues/350
const mdxOptions = { development: process.env.NODE_ENV === 'development' }

const components = {
  Button: ({ children, ...props }) => <button {...props} className='btn'>{children}</button>
}

// simple app util to find a post by slug, then format date
function findPostBySlug (slug, posts) {
  for (const post of posts) {
    if (post.slug === slug) {
      return post
    }
  }
  return null
}

export default function ({ post, collection, slug }) {
  const [blogPost, setBlogPost] = useState(post)
  const [user] = useLocalStorage('user', false)

  const updatePost = async (p) => {
    p.mdx = await serialize(p.children || '', { mdxOptions })
    setBlogPost(p)
  }

  // this pulls the client-side post
  useEffect(() => {
    if (!user) {
      return
    }

    if (collection) {
      const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: branch || 'main' })
      git.init().then(async () => {
        const posts = await git.getAllItems()
        if (posts) {
          const p = findPostBySlug(slug, posts)
          if (p) {
            updatePost(p)
          }
        }
      })
    }
  }, [user, collection])

  return blogPost && (
    <>
      <Head>
        Hello
        <title>{blogPost.title ? `Blog - ${blogPost.title}` : 'Blog'}</title>
      </Head>
      <EditorPage onUpdate={updatePost} item={blogPost} collection={collection} proxy={process.env.NEXT_PUBLIC_CORS_PROXY} repo={repo} branch={branch || 'main'}>
        <main className='prose m-auto mb-4'>
          <MDXRemote {...blogPost.mdx} components={components} />
        </main>
      </EditorPage>
    </>
  )
}

export async function getStaticPaths () {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog)
  const paths = (await content.list(true)).map(post => ({ params: { slug: post.slug } }))
  return {
    paths,
    fallback: true
  }
}

export async function getStaticProps ({ params: { slug } }) {
  const Content = (await import('@slimplate/filesystem')).default
  const content = new Content(collections.blog, 'blog')

  const post = findPostBySlug(slug, await content.list(true)) || {}

  post.mdx = await serialize(post.children || '', { mdxOptions })

  // TODO: since this will fallthrough we should check somehow if they are logged in, and 404 on missing, if not
  const props = {
    slug,
    collection: collections.blog,
    post
  }
  return { props }
}
