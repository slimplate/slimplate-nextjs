import { Html, Head, Main, NextScript } from 'next/document'
import { ButtonLogin } from '@slimplate/daisyui'

export default function Document () {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <ButtonLogin />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
