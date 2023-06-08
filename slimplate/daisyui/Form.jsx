import cx from 'classnames'
import dateFormat from 'dateformat'

const inputClass = 'p-2 bg-base-100 border border-neutral-500/20 rounded-md w-full'
export const widgetMap = {
  richtext: (value) => <textarea className={cx(inputClass)} rows='10' cols='40' defaultValue={value} />,
  date: (value) => <input className={cx(inputClass)} type='date' defaultValue={dateFormat(value, 'yyyy-mm-dd')} />,
  color: (value) => <input className={cx(inputClass)} type='color' defaultValue={value || '#FFFFFF'} />,
  default: (value) => <input className={cx(inputClass)} type='text' defaultValue={value} />
}

export default function Form ({ collection, item }) {
  return Object.keys(collection.fields).map((name) => {
    const field = collection.fields[name]
    const value = item ? item[name] : ''

    const inputElement = (widgetMap[field.type] || widgetMap.default)(value)
    return (
      <div key={name}>
        <label>{field.label}:</label>
        {inputElement}
      </div>
    )
  })
}
