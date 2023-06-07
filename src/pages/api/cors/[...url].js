import { cors } from '@slimplate/vercel'

export default function handler (req, res) {
  return cors(req.query.url.join('/'), req, res)
}
