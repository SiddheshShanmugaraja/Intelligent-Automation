import React from "react";
import Navbar from './Navbar'
import '../assets/css/Settings.css'
import { useState, useEffect } from "react";
import axios from 'axios'
import { baseUrl } from '../config'
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';



const Settings = () => {
    const [username, setusername] = useState('')
    const [oldpassword, setoldpassword] = useState('')
    const [newpassword, setnewpassword] = useState('')
    const [newpasswordconfirm, setnewpasswordconfirm] = useState('')

    const validate = () => {
        let valid = {} as any
        valid.oldpassword = oldpassword.length >= 5 && oldpassword.length < 10 ? "" : " old password should be between 5 to 10 characters"
        valid.newpassword = newpassword.length >= 5 && newpassword.length < 10 ? "" : " new password should be between 5 to 10 characters"
        valid.newpasswordconfirm = newpasswordconfirm.length >= 5 && newpasswordconfirm.length < 10 ? "" : " confirm new  password should be between 5 to 10 characters"
        valid.matched = newpassword === newpasswordconfirm ? "" : "new passwords did not match"
        return valid;
    }

    const handleSubmit = () => {
        const formData = new FormData();
        let obj = validate();
        if (Object.values(obj).every(item => item === "")) {
            // username, old_password and new_password
            formData.append('username', username)
            formData.append('old_password', oldpassword)
            formData.append('new_password', newpassword)
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
            Object.keys(obj).map(function (key) {
                if (obj[key] !== "") {
                    toast.error(obj[key], {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                }
                return 0
            });
        }

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
                            name='password'
                            onChange={(e) => setoldpassword(e.target.value)}

                        />
                    </div>
                    <div className="signup-password">
                        <p>New Password</p>
                        <input
                            type="password"
                            name='password'
                            onChange={(e) => setnewpassword(e.target.value)}

                        />
                    </div>
                    <div className="signup-password">
                        <p>Confirm New Password</p>
                        <input
                            type="password"
                            name='password'
                            onChange={(e) => setnewpasswordconfirm(e.target.value)}

                        />
                    </div>
                    <button className="signup-button" onClick={() => handleSubmit()} >
                        Reset password
          </button>

                </div>

            </div>
        </>
    )
}

export default Settings
