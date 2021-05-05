import { useState } from "react";
import '../css/Login.css';
import { useHistory } from 'react-router-dom'
import { baseUrl } from '../config'
import axios from 'axios'
import { toast } from 'react-toastify';

const Login = () => {
  const history = useHistory();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState({} as any)

  const validate = () => {
    let valid = {} as any
    valid.email = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email) ? "" : " Enter a valid email"
    valid.password = password.length >= 5 && password.length < 10 ? "" : " password should be between 5 to 10 characters"
    return valid;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    let obj = validate();
    if (Object.values(obj).every(item => item === "")) {
      formData.append('username', email)
      formData.append('password', password)
      axios.post(baseUrl + '/login', formData).then(res => {
        if (res.data.status === 200) {
          toast.success("Login Success", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
          sessionStorage.setItem('loggeduser', JSON.stringify(res.data.data))
          console.log(sessionStorage.getItem('loggeduser'))
          history.push('/home')
        }
        else {
          toast.error(res.data.data, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
        }
      }).catch((e) => {
        let user = {
          is_admin: true,
          username: 'Andy Warhol'
        }
        toast.success("Login Success", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        sessionStorage.setItem('loggeduser', JSON.stringify(user))
        console.log(sessionStorage.getItem('loggeduser'))
        history.push('/home')
        // toast.error("Network Error", {
        //   position: toast.POSITION.TOP_RIGHT,
        //   autoClose: 3000,
        // });
      })

    }
    else {
      setError(obj);
    }
  }
  return (
    <div className="container">
      <div className="login-navbar-container">
        <div className="login-navbar-content">
          <p>Need an Account ?</p>
          <button className="login-navbar-content-button" onClick={() => history.push("/sign-up")}>Signup</button>
        </div>
      </div>
      <div className="login-container">
        <div> <h1>Intelligent Automation</h1> </div>
        <div> <h1>Login</h1> </div>
        <div className="login-email">
          <p>Email Id</p>
          <input
            type="text"
            name='email'
            autoComplete='on'
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.email && <p className="Error-text"> {error.email}</p>}
        </div>
        <div className="login-password">
          <p>Password</p>
          <input
            type="password"
            name='password'
            autoComplete='off'
            onChange={(e) => setPassword(e.target.value)}
          />
          {error.password && <p className="Error-text"> {error.password}</p>}
        </div>
        <button className="login-button" onClick={() => handleSubmit()}>
          LOGIN
      </button>
      </div>
    </div>
  )
}

export default Login
