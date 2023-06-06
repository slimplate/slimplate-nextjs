import { Html, Head, Main, NextScript } from 'next/document'
import DaisyButtonLogin from '@slimplate/DaisyButtonLogin'

export default function Document () {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <DaisyButtonLogin />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
