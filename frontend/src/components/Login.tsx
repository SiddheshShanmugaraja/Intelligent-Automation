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
  const [values, setValues] = useState({ name: "", password: "" })
  const [error, setError] = useState({} as any)

  const validate = () => {
    let valid = {} as any
    valid.name = values.name.length > 0 ? "" : "Name is Required"
    valid.password = values.password.length >= 5 && values.password.length < 10 ? "" : "Password should be between 5 to 10 characters"
    return valid;
  }

  const handleSubmit = () => {
    const formData = new FormData();
    let obj = validate();
    if (Object.values(obj).every(item => item === "")) {
      formData.append('username', values.name)
      formData.append('password', values.password)
      axios.post(baseUrl + '/login', formData).then(res => {
        console.log(res)
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
  const validateOnChange = (field, val) => {
    let err
    switch (field) {
      case "name":
        err = val.length > 0 ? "" : "Name is Required";
        break;
      case "password":
        err = val.length >= 5 && val.length < 10 ? "" : "Password should be between 5 to 10 characters";
        break;
    }
    setError({ ...error, [field]: err })
  }
  const handleChange = (e) => {
    validateOnChange(e.target.name, e.target.value);
    setValues({ ...values, [e.target.name]: e.target.value })
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
        <Link to='/home' />
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
            onChange={(e) => handleChange(e)}
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
            onChange={(e) => handleChange(e)}
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
