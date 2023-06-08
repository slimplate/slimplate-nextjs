import { memo } from 'react'
import cx from 'classnames'
import dateFormat from 'dateformat'

const inputClass = 'p-2 bg-base-100 border border-neutral-500/20 rounded-md w-full'
export const widgetMap = {
  richtext: ({ value, onChange, name }) => <textarea id={name} name={name} className={cx(inputClass)} rows='10' cols='40' defaultValue={value} />,
  date: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='date' defaultValue={dateFormat(value, 'yyyy-mm-dd')} />,
  color: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='color' defaultValue={value || '#FFFFFF'} />,
  default: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='text' defaultValue={value} />
}

export default memo(function Form ({ collection, item }) {
  return Object.keys(collection.fields).map((name) => {
    const field = collection.fields[name]
    const value = item ? item[name] : ''
    const InputElement = memo(widgetMap[field.type] || widgetMap.default)

    return (
      <div key={name}>
        <label className='text-md' htmlFor={name}>{field.label}:</label>
        <InputElement value={value} name={name} />
      </div>
    )
  })
})
