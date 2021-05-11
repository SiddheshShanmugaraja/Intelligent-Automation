import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../assets/css/Sidebar.css'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const Sidebar = (props: any) => {
    const [sidebar, setSidebar] = useState(false)
    return (
        <div className="container">
            <div className={sidebar ? "sidebar" : "side-bar-hidden"}>
                <ul className="side-bar-list">
                    <Link to='/home'><li>Home</li></Link>
                    {props.loggedUser['is_admin'] && <Link to='/search'><li>Search</li></Link>}
                    <Link to='/profile'><li>Profile</li></Link>
                    <Link to='/settings'><li>Settings</li></Link>
                    <div className="side-bar-button">{sidebar ? <KeyboardArrowLeftIcon onClick={() => setSidebar(false)} /> : < KeyboardArrowRightIcon onClick={() => setSidebar(true)} />}</div>
                </ul>
            </div>
        </div>
    )
}
export default Sidebar