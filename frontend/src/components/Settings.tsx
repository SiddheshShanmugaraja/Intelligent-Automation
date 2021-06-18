import React from "react";
import Navbar from './Navbar'
import '../assets/css/Settings.css'
import { useState, useEffect } from "react";
import axios from 'axios'
import { baseUrl } from '../config'
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';



const Settings = () => {
    const [username, setusername] = useState('')
    const [values, setValues] = useState({ oldpassword: "", newpassword: "", newpasswordconfirm: "" })
    const [error, setError] = useState({} as any)

    const validate = () => {
        let valid = {} as any
        valid.oldpassword = values.oldpassword.length >= 5 && values.oldpassword.length <= 10 ? "" : "Old password should be between 5 to 10 characters"
        valid.newpassword = values.newpassword.length >= 5 && values.newpassword.length <= 10 ? values.newpassword === values.oldpassword ? "New password and old password cannot be the same" : "" : "New password should be between 5 to 10 characters"
        valid.newpasswordconfirm = values.newpasswordconfirm.length >= 5 && values.newpasswordconfirm.length < 10 ? values.newpassword !== values.newpasswordconfirm ? "Password mismatch" : "" : " Confirm new  password should be between 5 to 10 characters"
        return valid;
    }

    const handleSubmit = () => {
        const formData = new FormData();
        let obj = validate();
        if (Object.values(obj).every(item => item === "")) {
            // username, old_password and new_password
            formData.append('username', username)
            formData.append('old_password', values.oldpassword)
            formData.append('new_password', values.newpassword)
            axios.post(baseUrl + '/change-password', formData).then(res => {
                console.log(res, res.status)
                if (res.data.status === 200) {
                    toast.success("Password update successful!", {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    sessionStorage.setItem('loggeduser', JSON.stringify(res.data.data))

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
            console.log("found some error")
            console.log(obj)
            setError(obj);
        }

    }
    const validateOnChange = (field, val) => {
        let err, temp, tempField
        switch (field) {
            case "oldpassword":
                err = val.length >= 5 && val.length <= 10 ? "" : "Old Password should be between 5 to 10 characters"
                break;
            case "newpassword":
                err = val.length >= 5 && val.length <= 10 ? val === values.oldpassword ? "New password and old password cannot be the same" : "" : "New  Password should be between 5 to 10 characters"
                temp = values.newpasswordconfirm.length >= 5 && values.newpasswordconfirm.length <= 10 ? val !== values.newpasswordconfirm ? "Password mismatch " : "" : "Confirm new  password should be between 5 to 10 characters"
                tempField = "newpasswordconfirm"
                break;

            case "newpasswordconfirm":
                err = val.length >= 5 && val.length <= 10 ? val !== values.newpassword ? "Password mismatch " : "" : "Confirm new  password should be between 5 to 10 characters"
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


    useEffect(() => {
        let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
        setusername(loggeduser['username'])
    }, []);
    return (
        <>
            <Helmet>
                <title>Settings</title>
            </Helmet>
            <Navbar title={'Settings'} />
            <div className="container">

                <div className="profile-container">
                    <div><h1>Reset Password</h1> </div>
                    <div className="signup-password">
                        <p>Current Password</p>
                        <input
                            type="password"
                            name='oldpassword'
                            id='oldpassword'
                            onChange={(e) => handleChange(e)}

                        />
                        {error.oldpassword && <p className="Error-text"> {error.oldpassword}</p>}

                    </div>
                    <div className="signup-password">
                        <p>New Password</p>
                        <input
                            type="password"
                            name='newpassword'
                            id="newpassword"
                            onChange={(e) => handleChange(e)}

                        />
                        {error.newpassword && <p className="Error-text"> {error.newpassword}</p>}
                    </div>
                    <div className="signup-password">
                        <p>Confirm New Password</p>
                        <input
                            type="password"
                            name='newpasswordconfirm'
                            id="newpasswordconfirm"
                            onChange={(e) => handleChange(e)}

                        />
                        {error.newpasswordconfirm && <p className="Error-text"> {error.newpasswordconfirm}</p>}

                    </div>
                    <button className="signup-button" id="signup" name="signup" onClick={() => handleSubmit()} >
                        Reset password
                    </button>

                </div>

            </div>
        </>
    )
}

export default Settings
