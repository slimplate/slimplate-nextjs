import './globals.css'

export const metadata = {
  title: 'Slimplate Website',
  description: 'Awesome site'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <body className='p-4'>{children}</body>
    </html>
  )
}
