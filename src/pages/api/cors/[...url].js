import { cors } from '@slimplate/edge'

// this is required
export const config = {
  runtime: 'edge'
}

export default function handler (req, res) {
  return cors(req, res)
}
