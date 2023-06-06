// Client-side editor drawer

import { IconPencil } from '@tabler/icons-react'
import { useLocalStorage } from 'react-use'

export default function EditorPage ({ item, children }) {
  const [user, setUser, removeUser] = useLocalStorage('user', false)

  if (!user) {
    return children
  }

  return (
    <div className='drawer drawer-end'>
      <input id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <label htmlFor='slimplate-drawer' className='fixed top-2 right-2 btn drawer-button'><IconPencil>Edit</IconPencil></label>
        {children}
      </div>
      <div className='drawer-side'>
        <label htmlFor='slimplate-drawer' className='drawer-overlay' />
        <div className='menu p-4 w-80 h-full bg-base-200 text-base-content overflow-hidden'>
          <label htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>COOL!</label>
          <h2>EDITOR HERE</h2>
        </div>
      </div>
    </div>
  )
}
