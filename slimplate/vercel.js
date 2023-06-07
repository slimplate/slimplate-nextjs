// backend functions for use on vercel

import matchUrl from 'match-url-wildcard'

function validRedir (redirectUrlString, url) {
  const allUrls = redirectUrlString.split(',').map(s => s.trim()).filter(u => u)
  const matchedURLS = allUrls.find(s => matchUrl(url, s))
  console.log({ allUrls, matchedURLS })
  return !!matchedURLS
}

// top login function that triggers GH to authorize
export function ghlogin (req, res, redirectUrlString, githubClient) {
  const { redir, scope } = req.query
  if (redir) {
    if (validRedir(redirectUrlString, redir)) {
      return res.redirect(302, `https://github.com/login/oauth/authorize?client_id=${githubClient}&state=${encodeURIComponent(redir)}&scope=${encodeURIComponent(scope)}`)
    }
    return res.status(500).json({ error: true, message: 'Redir is not authorized' })
  } else {
    return res.status(500).json({ error: true, message: 'Please use redir param.' })
  }
}

// GH will callback here: use state to figure out actual redirect
export async function ghcallback (req, res, redirectUrlString, githubClient, githubSecret) {
  const { state, code } = req.query
  if (code && state) {
    const gh = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: githubClient,
        client_secret: githubSecret,
        code
      }),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    }).then(r => r.json())

    if (gh.error) {
      return res.status(500).json({ error: true, message: gh.error })
    }

    if (gh.access_token) {
      if (validRedir(redirectUrlString, state)) {
        return res.redirect(302, `${state}?gh=${gh.access_token}`)
      } else {
        return res.status(500).json({ error: true, message: 'URL not autorized.' })
      }
    }
  }
  return res.status(500).json({ error: true, message: 'Code & req must be provided.' })
}
