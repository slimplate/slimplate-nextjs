import { useEffect, useState } from 'react'
import { useLocalStorage } from '@slimplate/utils'
import { Octokit } from '@octokit/rest'

export default function ButtonLoginGithub ({ backendURL, redirectURL, scope = 'repo read:org read:user user:email' }) {
  const [user, setUser] = useLocalStorage('user', false)

  useEffect(() => {
    const s = new URL(document.location)
    const gh = s.searchParams.get('gh')

    if (gh) {
      const oktokit = new Octokit({ auth: gh })
      oktokit.rest.users.getAuthenticated().then(({ data }) => {
        setUser({ token: gh, ...data })
        s.searchParams.delete('gh')
        document.location.replace(s.toString())
      })
    }
  }, [])

  const onLoginClick = () => {
    document.location.replace(`${backendURL}?scope=${encodeURIComponent(scope)}&redir=${encodeURIComponent(redirectURL || document.location.toString())}`)
  }

  return (
    <div>
      {user
        ? (<button className='btn' onClick={() => setUser(null)}>Logout</button>)
        : (<button className='btn' onClick={onLoginClick}>Login</button>)}
    </div>
  )
}
