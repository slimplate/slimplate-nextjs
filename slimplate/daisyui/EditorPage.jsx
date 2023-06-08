// Client-side editor drawer
import { IconPencil, IconPlus } from '@tabler/icons-react'
import { useLocalStorage } from '@slimplate/utils'
import Form from './Form'

export default function EditorPage ({ item, collection, children }) {
  const [user] = useLocalStorage('user', false)

  if (!user) {
    return children
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
          <label htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>{item ? 'Update' : 'Create'}</label>
        </div>
      </div>
    </div>
  )
}
