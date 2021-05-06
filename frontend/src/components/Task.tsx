import React from 'react'
import '../assets/css/Task.css'

import Navbar from './Navbar'

const Task = () => {

    return (
        <>
            <Navbar title={'Home'} />
            <div className="task-management-container">
                <div className="task-management-footer">
                    <div className="task-management-footer-left">
                        <p>Copyright @ 2020-2021 | All rights reserved</p>
                    </div>
                    <div className="task-management-footer-right">
                        <p>Privacy Policy | Terms and Conditions | Sitemap</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Task


