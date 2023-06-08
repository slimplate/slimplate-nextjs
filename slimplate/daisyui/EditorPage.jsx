// Client-side editor drawer
import { useRef } from 'react'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useLocalStorage, tt } from '@slimplate/utils'
import Form from './Form'
import Git from '@slimplate/github'
import s from '@/../.slimplate.json'
import YAML from 'yaml'

const { repo, branch } = s

export default function EditorPage ({ item, collection, children }) {
  const [user] = useLocalStorage('user', false)
  const r = useRef()

  if (!user) {
    return children
  }

  const dirname = (f) => f.split('/').slice(0, -1).join('/')

  const handleSubmit = e => {
    e.preventDefault()
    const values = Object.fromEntries(new FormData(e.currentTarget).entries())

    const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: branch || 'main' })
    git.init().then(async () => {
      if (git.updated) {
        const filename = tt(collection.filename, { ...item, date: item.date.substring(0, 10) })

        const { children, ...frontmatter } = values
        const content = '---\n' + YAML.stringify(frontmatter) + '---\n' + (children || '')

        await git.mkdirp(dirname(filename))
        await git.write(filename, content)
        await git.add(filename)
        await git.commit('edited "' + filename + '" article.')

        // this should be done in a seperate sync
        // await git.pull()
        // await git.push()
      }
    })

    // close window
    r.current.checked = false
  }

  return (
    <div className='drawer'>
      <input ref={r} id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <label htmlFor='slimplate-drawer' className='sticky top-2 left-2 btn drawer-button'>
          {item
            ? <IconPencil>Edit</IconPencil>
            : <IconPlus>New</IconPlus>}
        </label>
        {children}
      </div>
      <div className='drawer-side'>
        <label htmlFor='slimplate-drawer' className='drawer-overlay' />
        <form className='p-4 menu h-full bg-base-200 text-base-content flex flex-col gap-4' onSubmit={handleSubmit}>
          <Form collection={collection} item={item} />
          <div className='flex gap-4'>
            <label htmlFor='slimplate-drawer' className='btn btn-outline mt-4 flex-grow'>Cancel</label>
            <button type='submit' className='btn btn-primary mt-4 basis-1/2'>{item ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
