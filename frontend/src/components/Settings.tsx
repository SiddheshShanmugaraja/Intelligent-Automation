import React from "react";
import Navbar from './Navbar'
import '../assets/css/Settings.css'

const Settings = () => {

    return (
        <>
            <Navbar title={'Settings'} />
            <div className="container">

                <div className="profile-container">
                    <div><h1>Reset Password</h1> </div>
                    <div className="signup-password">
                        <p>Current Password</p>
                        <input
                            type="password"
                            name='password'
                        />
                    </div>
                    <div className="signup-password">
                        <p>New Password</p>
                        <input
                            type="password"
                            name='password'
                        />
                    </div>
                    <div className="signup-password">
                        <p>ConfirmNew Password</p>
                        <input
                            type="password"
                            name='password'
                        />
                    </div>
                    <button className="signup-button" >
                        Reset
          </button>

                </div>

            </div>
        </>
    )
}

export default Settings
