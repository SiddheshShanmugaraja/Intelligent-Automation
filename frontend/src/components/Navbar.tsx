import React from 'react'
import SettingsIcon from '@material-ui/icons/Settings';
import Avatar from 'react-avatar';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Sidebar from './Sidebar';
import { useHistory } from 'react-router-dom';
import "../assets/css/Navbar.css";
import { Link } from 'react-router-dom'

import { baseUrl } from "../config";
const Navbar = (props: any) => {
    const history = useHistory();
    let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
    const logout = () => {
        if (sessionStorage.getItem('loggeduser') !== null) {
            sessionStorage.removeItem('loggeduser')
            history.push("/")

        } else {
            console.log("Logout Error");
        }
    }
    return (
        <>
            <div className="d-none" >
                <Link to='/' />
                <Link to='/sign-up' />
                <Link to='/profile' />
                <Link to='/search' />
                <Link to='/home' />

            </div>
            <Sidebar loggedUser={loggeduser} />
        <div className="navbar">
                <p>{props.title}</p>
                {loggeduser &&
                    <div className="navbar-right-items">
                        <div className="navbar-right-items-profile cpointer" id="profile-pic" onClick={() => history.push('/profile')}  >
                            <Avatar name={loggeduser['username']}  src={baseUrl + "/" + loggeduser['photo']} size="40" round={true} color="#009999" />
                            <p className="navbar-profile-name" id="profile-name">{loggeduser['username']}</p>
                        </div>
                        <SettingsIcon id="settings-nav" className="cpointer" onClick={() => history.push('/settings')} />
                        <ExitToAppIcon id="logout-nav" className="cpointer" onClick={() => logout()} />
                    </div>
                }
            </div>
        </>
    )
}
export default Navbar;