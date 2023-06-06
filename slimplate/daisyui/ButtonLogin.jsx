import React from 'react'
import { useLocalStorage } from 'react-use'
import { Octokit } from '@octokit/rest'

export default function ButtonLogin ({ backendURL }) {
  const [user, setUser, removeUser] = useLocalStorage('user', false)
  const [token, setToken, removeToken] = useLocalStorage('token', false)

  const handleLogin = async () => {
    try {
      const octokit = new Octokit({
        auth: token
      })

      const result = await octokit.rest.users.getAuthenticated()

      // set token in user
      const newUser = result.data
      newUser.token = token

      console.log(result.data)
      setUser(result.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {user
        ? (
          <div>
            <p>Welcome, {user.name}!</p>
            <button onClick={() => setUser(null)}>Logout</button>
          </div>
          )
        : (<button onClick={handleLogin}>Login with GitHub</button>)}
    </div>
  )
}
