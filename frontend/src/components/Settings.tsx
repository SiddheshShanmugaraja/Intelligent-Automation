import React, { useState, useEffect } from "react";
import Navbar from './Navbar'
import Avatar from 'react-avatar'
import andy from '../img/andy.jpg'
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import '../css/Settings.css'

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        color: 'black',
        height: '300px',
        padding: theme.spacing(2, 4, 3),
    },
}));


const Settings = () => {
    const classes = useStyles();
    const [name, setName] = useState('')
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        setName("Andy Warhol")
    }, []);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };




    return (
        <>
            <Navbar title={'Settings'} />
            <div className="container">
                <div className="profile-container">
                    <div><h1>Change Profile Picture <EditIcon onClick={() => handleOpen()} className="cpointer" />
                    </h1> </div>
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={classes.modal}
                        open={open}
                        onClose={handleClose}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                            timeout: 500,
                        }}
                    >

                        <Fade in={open}>
                            <div className={classes.paper} style={{ border: "1.5px dashed blue" }}>
                                <p id="transition-modal-description" style={{ marginTop: "30%" }}>Drag n Drop or Click to upload profile picture</p>

                            </div>
                        </Fade>
                    </Modal>
                    <div className="profile-avatar">
                        <Avatar name={name} src={andy} size="300" round={false} color="#009999" />
                    </div>
                </div>
                <div className="profile-container">
                    <div><h1>Reset Password                     </h1> </div>
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
