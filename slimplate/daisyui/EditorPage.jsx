// Client-side editor drawer
import cx from 'classnames'
import { IconPencil } from '@tabler/icons-react'
import { useLocalStorage } from '@slimplate/utils'
import dateFormat from 'dateformat'

const inputClass = 'p-2 bg-base-100 border border-neutral-500/20 rounded-md w-full'

const widgetMap = {
  richtext: (value) => <textarea className={cx(inputClass)} rows='10' cols='40' defaultValue={value} />,
  date: (value) => <input className={cx(inputClass)} type='date' defaultValue={dateFormat(value, 'yyyy-mm-dd')} />,
  color: (value) => <input className={cx(inputClass)} type='color' defaultValue={value || '#FFFFFF'} />,
  default: (value) => <input className={cx(inputClass)} type='text' defaultValue={value} />
}

export default function EditorPage ({ item, git, children }) {
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
        <div className='menu h-full bg-base-200 text-base-content flex flex-col gap-4'>
          {Object.keys(git.collection.fields).map((name) => {
            const field = git.collection.fields[name]
            const value = item[name]

            const inputElement = (widgetMap[field.type] || widgetMap.default)(value)
            return (
              <div key={name}>
                <label>{field.label}:</label>
                {inputElement}
              </div>
            )
          })}
          <label htmlFor='slimplate-drawer' className='btn btn-primary mt-4'>Save</label>
        </div>
      </div>
    </div>
  )
}
