// Client-side editor drawer
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useLocalStorage, tt } from '@slimplate/utils'
import Form from './Form'
import Git from '@slimplate/github'
import s from '@/../.slimplate.json'

const { repo, branch } = s

export default function EditorPage ({ item, collection, children }) {
  const [user] = useLocalStorage('user', false)

  if (!user) {
    return children
  }

  const handleSubmit = () => {
    console.log(collection.filename)
    const git = new Git({ collection, repo, proxy: process.env.NEXT_PUBLIC_CORS_PROXY, branch: branch || 'main' })
    git.init().then(async () => {
      if (git.updated) {
        console.log(collection)
        await git.pull()
        const filename = tt(collection.filename, { ...item, date: item.date.substring(0, 10) })
        await git.add(filename)
        await git.commit('making test')
        await git.push()
      }
    })
  }

  return (
    <div className='drawer'>
      <input id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
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
        <div className='menu h-full bg-base-200 text-base-content flex flex-col gap-4'>
          <Form collection={collection} item={item} />
          <label onClick={handleSubmit} htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>{item ? 'Update' : 'Create'}</label>
        </div>
      </div>
    </div>
  )
}
