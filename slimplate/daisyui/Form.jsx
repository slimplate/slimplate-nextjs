import cx from 'classnames'
import dateFormat from 'dateformat'

const inputClass = 'p-2 bg-base-100 border border-neutral-500/20 rounded-md w-full'
export const widgetMap = {
  richtext: ({ value, onChange, name }) => <textarea id={name} name={name} className={cx(inputClass)} rows='10' cols='40' defaultValue={value} onChange={e => onChange(e.target.value)} />,
  date: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='date' defaultValue={dateFormat(value, 'yyyy-mm-dd')} onChange={e => onChange(e.target.value)} />,
  color: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='color' defaultValue={value || '#FFFFFF'} onChange={e => onChange(e.target.value)} />,
  default: ({ value, onChange, name }) => <input id={name} name={name} className={cx(inputClass)} type='text' defaultValue={value} onChange={e => onChange(e.target.value)} />
}

export default function Form ({ collection, item }) {
  return Object.keys(collection.fields).map((name) => {
    const field = collection.fields[name]
    const value = item ? item[name] : ''
    const InputElement = widgetMap[field.type] || widgetMap.default

    const handleChange = (newVal) => {
      item[name] = newVal
    }

    return (
      <div key={name}>
        <label htmlFor={name}>{field.label}:</label>
        <InputElement onChange={handleChange} value={value} name={name} />
      </div>
    )
  })
}
