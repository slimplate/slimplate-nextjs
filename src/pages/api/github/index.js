import { ghlogin } from '@slimplate/edge'

// this is required
export const config = {
  runtime: 'edge'
}

const { REDIRECT_URL, GITHUB_CLIENT, GITHUB_SECRET } = process.env

export default function handler (req, res) {
  if (!REDIRECT_URL) {
    return new Response('set REDIRECT_URL', { status: 500 })
  }
  if (!GITHUB_CLIENT) {
    return new Response('set GITHUB_CLIENT', { status: 500 })
  }
  if (!GITHUB_SECRET) {
    return new Response('set GITHUB_SECRET', { status: 500 })
  }

  return ghlogin(req, res, REDIRECT_URL, GITHUB_CLIENT)
}
