import React, { useState } from "react";
import '../assets//css/Signup.css';
import { useHistory } from 'react-router-dom'
import { baseUrl } from '../config'
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {

  const history = useHistory();
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [cnfpassword, setCnfPassword] = useState('')
  const [error, setError] = useState({} as any)

  const validate = () => {
    let valid = {} as any
    valid.name = name.length > 0 ? "" : "*Name is Required"
    valid.email = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email) ? "" : "*Enter a valid email"
    valid.password = password.length >= 5 && password.length < 10 ? "" : "*Password should be between 5 to 10 characters"
    valid.cnfpassword = cnfpassword.length > 0 && password !== cnfpassword ? "*Password mismatch " : ""
    return valid;
  }
  const handleSubmit = () => {
    const formData = new FormData();
    let obj = validate();
    if (Object.values(obj).every(item => item === "")) {
      formData.append('email', email)
      formData.append('username', name)
      formData.append('password', password)
      axios.post(baseUrl + '/sign-up', formData).then(res => {
        if (res.data.status === 200) {
          toast.success(res.data.message, {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
          history.push('/')
        }
        else {
          toast.error(res.data.data, {
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
      <div className="signup-navbar-container">
        <div className="signup-navbar-content">
          <p>Already have an account ?</p>
          <button className="signup-navbar-content-button" onClick={() => history.push("/")}>Login</button>
        </div>
      </div>
      <div className="signup-container">
        <div> <h1>Signup</h1> </div>
        <div className="signup-email">
          <p>Username</p>
          <input
            type="text"
            name='name'
            onChange={(e) => setName(e.target.value)}
          />
          {error.name && <p className="Error-text"> {error.name}</p>}
        </div>
        <div className="signup-email">
          <p>Email</p>
          <input
            type="text"
            name='email'
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.email && <p className="Error-text"> {error.email}</p>}

        </div>
        <div className="signup-password">
          <p>Password</p>
          <input
            type="password"
            name='password'
            onChange={(e) => setPassword(e.target.value)}
          />
          {error.password && <p className="Error-text"> {error.password}</p>}
        </div>
        <div className="signup-password">
          <p>Confirm Password</p>
          <input
            type="password"
            name='password'
            onChange={(e) => setCnfPassword(e.target.value)}
          />
          {error.cnfpassword && <p className="Error-text"> {error.cnfpassword}</p>}
        </div>
        <button className="signup-button" onClick={() => handleSubmit()} >
          SignUp
          </button>
      </div>
      <div className="signup-footer-container">
        <p>By signing up I accept the <span>Terms & Conditions </span> and the  <span>Privacy Policy </span></p>
      </div>
    </div>
  )
}

export default Signup
