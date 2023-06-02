'use client'

export default function BlogDisplay ({ children, title, date }) {
  return (
    <div className='prose'>
      <h2>{title}</h2>
      <div className=''>
        {children}
      </div>
    </div>
  )
}
