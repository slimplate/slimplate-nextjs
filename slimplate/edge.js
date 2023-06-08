// backend functions for use on vercel

import matchUrl from 'match-url-wildcard'

function validRedir (redirectUrlString, url) {
  const allUrls = redirectUrlString.split(',').map(s => s.trim()).filter(u => u)
  const matchedURLS = allUrls.find(s => matchUrl(url, s))
  return !!matchedURLS
}

// top login function that triggers GH to authorize
// pages/api/github/index.js
export async function ghcallback (req, res, REDIRECT_URL, GITHUB_CLIENT, GITHUB_SECRET) {
  const u = new URL(req.url)
  const state = u.searchParams.get('state')
  const code = u.searchParams.get('code')

  if (code && state) {
    const gh = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: GITHUB_CLIENT,
        client_secret: GITHUB_SECRET,
        code
      }),
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    }).then(r => r.json())

    if (gh.error) {
      return new Response(JSON.stringify(gh), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    if (gh.access_token) {
      if (validRedir(REDIRECT_URL, state)) {
        return Response.redirect(`${state}?gh=${gh.access_token}`, 302)
      } else {
        console.error(`URL not authorized: ${redir}`)
        return new Response('URL not authorized.', { status: 500 })
      }
    }
  }
}

// GH will callback here: use state to figure out actual redirect
// pages/api/github/callback.js
export async function ghlogin (req, res, REDIRECT_URL, GITHUB_CLIENT) {
  const u = new URL(req.url)
  const redir = u.searchParams.get('redir')
  const scope = u.searchParams.get('scope')

  // user initiated
  if (validRedir(REDIRECT_URL, redir)) {
    return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT}&state=${encodeURIComponent(redir)}&scope=${encodeURIComponent(scope)}`, 302)
  } else {
    console.error(`URL not authorized: ${redir}`)
    return new Response('URL not authorized.', { status: 500 })
  }
}

// CORS proxy for git.
// pages/api/cors/[...url].js
export async function cors (req, res) {
  // on vercel-edge, there is no simple way to get `[...url]` part
  const u = new URL(req.url)
  const baseUrl = 'https://' + u.searchParams.getAll('url').join('/')
  u.searchParams.delete('url')
  const url = baseUrl + '?' + u.searchParams.toString()

  if (!url) {
    return new Response(null, {
      status: 500,
      statusText: 'Please set the URL you are requesting.'
    })
  }

  const requestHeaders = new Headers(req.headers)

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400'
  }

  if (
    requestHeaders.get('Origin') !== null &&
        requestHeaders.get('Access-Control-Request-Method') !== null &&
        requestHeaders.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': requestHeaders.get('Access-Control-Request-Headers')
      }
    })
  }

  const apiUrl = new URL(url)

  requestHeaders.set('Origin', apiUrl.origin)
  requestHeaders.set('Referer', apiUrl.toString())
  requestHeaders.set('Host', apiUrl.hostname)
  let response = await fetch(apiUrl, { method: req.method, body: req.body, headers: requestHeaders })
  response = new Response(response.body, response)

  if (response.headers.has('Location')) {
    const newUrl = response.headers.get('Location').replace(/^https?:\//, '/api/cors')
    response.headers.set('Location', newUrl)
  }

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.append('Vary', 'Origin')
  return response
}
