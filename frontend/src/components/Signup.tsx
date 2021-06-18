import React, { useState } from "react";
import '../assets//css/Signup.css';
import { useHistory } from 'react-router-dom'
import { baseUrl } from '../config'
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom'

const Signup = () => {

  const history = useHistory();
  const [values, setValues] = useState({ name: "", password: "", email: "", cnfpassword: "" })
  const [error, setError] = useState({} as any)

  const validate = () => {
    let valid = {} as any
    valid.name = values.name.length > 0 ? "" : "Name is Required"
    valid.email = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(values.email) ? "" : "Enter a valid email"
    valid.password = values.password.length >= 5 && values.password.length <= 10 ? "" : "Password should be between 5 to 10 characters"
    valid.cnfpassword = values.cnfpassword.length > 0 && values.cnfpassword.length <= 10 ? values.password !== values.cnfpassword ? "Password mismatch " : "" : "Confirm password should be between 5 to 10 characters"
    return valid;
  }
  const handleSubmit = () => {
    const formData = new FormData();
    let obj = validate();
    if (Object.values(obj).every(item => item === "")) {
      formData.append('email', values.email)
      formData.append('username', values.name)
      formData.append('password', values.password)
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
  const validateOnChange = (field, val) => {
    let err, temp, tempField
    switch (field) {
      case "name":
        err = val.length > 0 ? "" : "Name is Required";
        break;
      case "email":
        err = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(val) ? "" : "Enter a valid email";
        break;
      case "password":
        err = val.length >= 5 && val.length <= 10 ? "" : "Password should be between 5 to 10 characters"
        temp = values.cnfpassword.length >= 5 && values.cnfpassword.length <= 10 ? val !== values.cnfpassword ? "Password mismatch " : "" : "Confirm password should be between 5 to 10 characters"
        tempField = "cnfpassword"
        break;
      case "cnfpassword":
        err = val.length >= 5 && val.length <= 10 ? val !== values.password ? "Password mismatch " : "" : "Confirm password should be between 5 to 10 characters"
        break;
    }
    if (tempField) {
      setError({ ...error, [field]: err, [tempField]: temp })
    }
    else {
      setError({ ...error, [field]: err })
    }
  }
  const handleChange = (e) => {
    validateOnChange(e.target.name, e.target.value);
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  return (
    <div className="container">
      <div className="d-none" >
        <Link to='/' />
        <Link to='/sign-up' />
        <Link to='/profile' />
        <Link to='/search' />
        <Link to='/home' />
      </div>
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <div className="signup-navbar-container">
        <div className="signup-navbar-content">
          <p>Already have an account ?</p>
          <button className="signup-navbar-content-button" name="Login" id="Login" onClick={() => history.push("/")}>Login</button>
        </div>
      </div>
      <div className="signup-container">
        <div> <h1>Signup</h1> </div>
        <div className="signup-email">
          <p>Username</p>
          <input
            type="text"
            name='name'
            id='name'
            onChange={(e) => handleChange(e)}
          />
          {error.name && <p className="Error-text"> {error.name}</p>}
        </div>
        <div className="signup-email">
          <p>Email</p>
          <input
            type="text"
            name='email'
            id='email'
            onChange={(e) => handleChange(e)}
          />
          {error.email && <p className="Error-text"> {error.email}</p>}

        </div>
        <div className="signup-password">
          <p>Password</p>
          <input
            type="password"
            name='password'
            id='password'
            onChange={(e) => handleChange(e)}
          />
          {error.password && <p className="Error-text"> {error.password}</p>}
        </div>
        <div className="signup-password">
          <p>Confirm Password</p>
          <input
            type="password"
            name='cnfpassword'
            id='cnfpassword'
            onChange={(e) => handleChange(e)}
          />
          {error.cnfpassword && <p className="Error-text"> {error.cnfpassword}</p>}
        </div>
        <button name="signup" id="signup" className="signup-button" onClick={() => handleSubmit()} >
          SignUp
        </button>
      </div>
      <div className="text-center text-white mt-4">
        <p>By signing up I accept the <span>Terms & Conditions </span> and the  <span>Privacy Policy </span></p>
      </div>
    </div>
  )
}

export default Signup
