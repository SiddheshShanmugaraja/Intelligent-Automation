import { useState } from "react";
import '../assets//css/Login.css';
import { useHistory } from 'react-router-dom'
import { baseUrl } from '../config'
import axios from 'axios'
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async';

const Login = () => {
  const history = useHistory();
  // const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState({} as any)

  const validate = () => {
    let valid = {} as any
    valid.name = name.length > 0 ? "" : "*Name is Required"
    // valid.email = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email) ? "" : " Enter a valid email"
    valid.password = password.length >= 5 && password.length < 10 ? "" : " password should be between 5 to 10 characters"
    return valid;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    let obj = validate();
    if (Object.values(obj).every(item => item === "")) {
      formData.append('username', name)
      formData.append('password', password)
      axios.post(baseUrl + '/login', formData).then(res => {
        if (res.data.status === 200) {
          toast.success("Login Success", {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
          sessionStorage.setItem('loggeduser', JSON.stringify(res.data.data))
          sessionStorage.setItem('credit', JSON.stringify(res.data.data.credit))
          history.push('/home')
        }
        else {
          toast.error(res.data.message, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
        }
      }).catch((e) => {
        toast.error("Network Error", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      })

    }
    else {
      setError(obj);
    }
  }
  return (
    <div className="container">
      <Helmet>
        <title>Login</title>
      </Helmet>
      <div className="d-none" >
        <Link to='/' />
        <Link to='/sign-up' />
        <Link to='/profile' />
        <Link to='/search' />
      </div>
      <div className="login-navbar-container">
        <div className="login-navbar-content">
          <p>Need an Account ?</p>
          <button className="login-navbar-content-button" name="signup" id="signup" onClick={() => history.push("/sign-up")}>Signup</button>
        </div>
      </div>
      <div className="login-container">
        <div> <h1>Intelligent Automation</h1> </div>
        <div> <h1>Login</h1> </div>
        <div className="login-email">
          <p>Username</p>
          <input
            type="text"
            name='name'
            id='name'
            autoComplete='on'
            onChange={(e) => setName(e.target.value)}
          />
          {error.name && <p className="Error-text"> {error.name}</p>}
        </div>
        <div className="login-password">
          <p>Password</p>
          <input
            type="password"
            name='password'
            id='password'
            autoComplete='off'
            onChange={(e) => setPassword(e.target.value)}
          />
          {error.password && <p className="Error-text"> {error.password}</p>}
        </div>
        <button name="login" id="login" className="login-button" onClick={() => handleSubmit()}>
          LOGIN
      </button>
      </div>
    </div>
  )
}

export default Login
