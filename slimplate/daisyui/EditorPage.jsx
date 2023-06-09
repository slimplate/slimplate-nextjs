// Client-side editor drawer
import { useRef, memo } from 'react'
import YAML from 'yaml'
import { IconPencil, IconPlus, IconX } from '@tabler/icons-react'
import { useLocalStorage, tt } from '@slimplate/utils'
import Git from '@slimplate/github'
import ButtonSync from './ButtonSync'
import Form from './Form'
import { useRouter } from 'next/router'
import StatusIndicator from './StatusIndicator'

export default memo(function EditorPage ({ status, showSync = false, onUpdate = () => {}, item, collection, repo, proxy, branch = 'main', children }) {
  const [user] = useLocalStorage('user', false)
  const router = useRouter()
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

  const handleDelete = () => {
    const git = new Git({ collection, repo, proxy, branch })
    git.init().then(async () => {
      if (git.updated) {
        await git.rm(item.filename)
        await git.commit('removed "' + item.filename + '.')
        router.push(`/${collection.name}`)
      }
    })
  }

  return (
    <div className='drawer'>
      <input ref={r} id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <div className='flex flex-col gap-2 w-16 sticky top-2 left-2 '>
          <label htmlFor='slimplate-drawer' className='btn drawer-button'>
            {item
              ? <IconPencil>Edit</IconPencil>
              : <IconPlus>New</IconPlus>}
          </label>

          {item && (
            <>
              <button className='btn' onClick={() => window.my_modal_1.showModal()}><IconX>Close</IconX></button>
              <dialog id='my_modal_1' className='modal'>
                <form method='dialog' className='modal-box'>
                  <h3 className='font-bold text-lg'>Delete article
                  </h3>
                  <h3 className='py-4'>Are you sure you wish to delete {collection.name} article
                    <span className='ml-1 text-accent'>{item.title}</span>?
                  </h3>
                  <div className='modal-action'>
                    <button onClick={handleDelete} className='btn btn-outline btn-error'>Delete</button>
                  </div>
                </form>
              </dialog>
            </>
          )}
        </div>

        {children}
        <div className='fixed top-20 right-2'>
          {showSync && (
            <ButtonSync status={status} collection={collection} repo={repo} proxy={proxy} branch={branch}>
              <StatusIndicator status={status} />
              Sync
            </ButtonSync>
          )}
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
