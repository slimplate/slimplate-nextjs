// Client-side editor drawer
import { useRef, memo, useState } from 'react'
import YAML from 'yaml'
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useLocalStorage, tt, dateFormat } from '@slimplate/utils'
import Git from '@slimplate/github'
import ButtonSync from './ButtonSync'
import Form from './Form'

export default memo(function EditorPage ({ onUpdate = () => {}, item, collection, repo, proxy, branch = 'main', children }) {
  const [user] = useLocalStorage('user', false)
  const r = useRef()

  if (!user) {
    return children
  }

  const dirname = (f) => f.split('/').slice(0, -1).join('/')

  const handleSubmit = e => {
    e.preventDefault()
    const values = Object.fromEntries(new FormData(e.currentTarget).entries())

    const git = new Git({ collection, repo, proxy, branch })
    git.init().then(async () => {
      if (git.updated) {
        const filename = item ? item.filename : tt(collection.filename, { ...values, date: new Date(values.date || undefined).toISOString() })

        const { children, ...frontmatter } = values
        const content = '---\n' + YAML.stringify(frontmatter) + '---\n' + (children || '')

        await git.mkdirp(dirname(filename))
        await git.write(filename, content)
        await git.add(filename)
        await git.commit('edited "' + filename + '" article.')

        // close sidebar
        r.current.checked = false

        // force re-render from parent by giving it the value from form
        onUpdate({ ...values, filename })
      }
    })
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
        <div className='fixed top-16 right-2'>
          <ButtonSync collection={collection} repo={repo} proxy={proxy} branch={branch} />
        </div>
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
})
