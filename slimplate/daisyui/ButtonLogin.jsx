import { useLocalStorage } from 'react-use'

export default function DaisyButtonLogin () {
  const [user, setUser, removeUser] = useLocalStorage('user', false)

  const onSubmit = () => {
    // user.token = whatever
    // setUser(user)
  }

  if (user) {
    return <div>LOGOUT</div>
  }
  return <div>LOGIN</div>
}
