// Client-side editor drawer
import cx from 'classnames'
import { IconPencil } from '@tabler/icons-react'
import { useLocalStorage } from '@slimplate/utils'

const inputClass = 'p-2 bg-base-100 border border-neutral-500/20 rounded-md w-full'

const widgetMap = {
  richtext: (value) => <textarea className={cx(inputClass)} rows='10' cols='40' defaultValue={value} />,
  date: (value) => <input className={cx(inputClass)} type='date' defaultValue={value || new Date()} />,
  color: (value) => <input className={cx(inputClass)} type='color' defaultValue={value || '#FFFFFF'} />,
  default: (value) => <input className={cx(inputClass)} type='text' defaultValue={value} />
}

export default function EditorPage ({ item, slimplate, children }) {
  const [user] = useLocalStorage('user', false)

  if (!user) {
    return children
  }

  const fields = slimplate.collection.fields
  const sortedFields = fields.sort((a, b) => {
    if (a.type === 'richtext') return 1
    if (b.type === 'richtext') return -1
    return 0
  })

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

          {sortedFields.map((field) => {
            let value = item[field.name]

            if (field.name === 'date') {
              const inputDate = new Date('March 7, 2023')
              const year = inputDate.getFullYear()
              const month = String(inputDate.getMonth() + 1).padStart(2, '0')
              const day = String(inputDate.getDate()).padStart(2, '0')

              value = `${year}-${month}-${day}`
            }
            const inputElement = (widgetMap[field.type] || widgetMap.default)(value)

            return (
              <div key={field.name}>
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
