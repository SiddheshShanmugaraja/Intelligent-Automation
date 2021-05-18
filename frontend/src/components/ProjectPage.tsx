import React from 'react'
import '../assets/css/Task.css'
import Project from "./Project"
import Navbar from './Navbar'

const Task = () => {

    return (
        <>
            <Navbar title={'Project'} />
            <div className="task-management-container">
                <div className="task-management-body">
                    <Project />
                </div>
            </div>
        </>
    )
}

export default Task


