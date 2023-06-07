// Client-side editor drawer

import { IconPencil } from '@tabler/icons-react'
import { useLocalStorage } from '@slimplate/utils'

export default function EditorPage ({ item, slimplate, children }) {
  const [user] = useLocalStorage('user', false)

  if (!user) {
    return children
  }

  return (
    <div className='drawer'>
      <input id='slimplate-drawer' type='checkbox' className='drawer-toggle' />
      <div className='drawer-content'>
        <label htmlFor='slimplate-drawer' className='sticky top-2 left-2 btn drawer-button'><IconPencil>Edit</IconPencil></label>
        {children}
      </div>
      <div className='drawer-side'>
        <label htmlFor='slimplate-drawer' className='drawer-overlay' />
        <div className='menu p-4 w-80 h-full bg-base-200 text-base-content'>
          <label htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>COOL!</label>
          <h2>EDITOR HERE</h2>
          {/**
          item is server-side version of this
          get the client-side version from slimplate.getClientsideItem, and if it's not set, use server-side version
          **/}
        </div>
      </div>
    </div>
  )
}
