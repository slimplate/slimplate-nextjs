import { ghcallback } from '@slimplate/vercel'

const { REDIRECT_URL, GITHUB_CLIENT, GITHUB_SECRET } = process.env

export default function handler (req, res) {
  if (!REDIRECT_URL) {
    return res.status(500).json({ error: true, message: 'set REDIRECT_URL' })
  }
  if (!GITHUB_CLIENT) {
    return res.status(500).json({ error: true, message: 'set GITHUB_CLIENT' })
  }
  if (!GITHUB_SECRET) {
    return res.status(500).json({ error: true, message: 'set GITHUB_SECRET' })
  }

  return ghcallback(req, res, REDIRECT_URL, GITHUB_CLIENT, GITHUB_SECRET)
}
