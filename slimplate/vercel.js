// backend functions for use on vercel

import matchUrl from 'match-url-wildcard'

function validRedir (redirectUrlString, url) {
  const allUrls = redirectUrlString.split(',').map(s => s.trim()).filter(u => u)
  const matchedURLS = allUrls.find(s => matchUrl(url, s))
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

// do CORS proxy for git
export async function cors (url, req, res) {
  if (!url) {
    return res.status(500).json({ error: true, message: 'No URL param' })
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method != 'POST' && req.method != 'GET') {
    return res.send(null)
  }

  const requestHeaders = new Headers(req.headers)

  if (
    requestHeaders.get('Origin') !== null &&
    requestHeaders.get('Access-Control-Request-Method') !== null &&
    requestHeaders.get('Access-Control-Request-Headers') !== null
  ) {
    res.setHeader('Access-Control-Allow-Headers', requestHeaders.get('Access-Control-Request-Headers'))
    return res.send(null)
  }

  const apiUrl = new URL('https://' + url)

  const request = new Request(apiUrl, req)
  if (!requestHeaders.get('user-agent') || !requestHeaders.get('user-agent').startsWith('git/')) {
    requestHeaders.set('user-agent', 'git/@isomorphic-git/cors-proxy')
  }
  requestHeaders.set('Origin', apiUrl.origin)
  requestHeaders.set('Referer', apiUrl.toString())
  requestHeaders.set('Host', apiUrl.hostname)
  const response = await fetch(apiUrl, { headers: requestHeaders })

  res.send('OK')
//
//   response = new Response(response.body, response)
//   if (response.headers.has('Location')) {
//     const newUrl = response.headers.get('Location').replace(/^https?:\//, '/api/cors')
//     response.headers.set('Location', newUrl)
//   }
//
//   response.headers.set('Access-Control-Allow-Origin', '*')
//   response.headers.append('Vary', 'Origin')
//
//   return response
}
