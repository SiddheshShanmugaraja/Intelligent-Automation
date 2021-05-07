import React, { useState, useEffect } from "react";
import '../assets/css/Profile.css'
import Navbar from './Navbar'
import { TextField } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import { useDropzone } from 'react-dropzone';
import { baseUrl } from '../config'
import axios from 'axios';
import { toast } from 'react-toastify';
import Avatar from 'react-avatar';
import { CircularProgress } from '@material-ui/core';

// import axios from 'axios';
const Profile = () => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [country, setCountry] = useState('')
    const [dob, setdob] = useState('')
    const [formatdob, setformatdob] = useState('')
    const [gender, setGender] = useState('')
    const [about, setAbout] = useState('')
    const [check, setCheck] = React.useState({
        Mobile: false,
        Computer: false,
        Tablet: false,
    });
    const [photo, setPhoto] = React.useState('')
    const [phone, setPhone] = useState('')
    const [file, setFile] = React.useState('')
    const formatdate = (date: any) => {
        let month = String(date.getMonth() + 1);
        let day = String(date.getDate());
        const year = String(date.getFullYear());
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        var formated = `${day}/${month}/${year}`;
        setformatdob(formated)
    }
    useEffect(() => {
        let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
        setName(loggeduser['username'])
        setEmail(loggeduser['email'])
        setCountry(loggeduser['country'])
        setGender(loggeduser['gender'])
        loggeduser['dob'] && setdob(loggeduser['dob'].replaceAll("/", "-").split("-").reverse().join("-"))
        setAbout(loggeduser['about'])
        setPhone(loggeduser['phone'])
        setPhoto(baseUrl + '/' + loggeduser['photo'])
        let device = loggeduser['device']
        if (loggeduser['device']) {
            let obj = {
                Mobile: device.includes("Mobile") ? true : false,
                Computer: device.includes("Computer") ? true : false,
                Tablet: device.includes("Tablet") ? true : false,
            }
            setCheck(obj)
        }
    }, []);


    const baseStyle = React.useMemo(() =>
    ({
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 2,
        borderColor: 'grey',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: 'black',
        outline: 'none',
        transition: 'border .24s ease-in-out'
    }), []);

    const activeStyle = React.useMemo(() =>
    ({
        borderColor: '#2196f3'
    }), []);
    const acceptStyle = React.useMemo(() =>
    ({
        borderColor: '#00e676'
    }), []);

    const rejectStyle = React.useMemo(() =>
    ({
        borderColor: '#ff1744'
    }), []);
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: 'image/*',
        multiple: false,
        onDrop: files => handleDrop(files)
    });

    const handleDrop = (files: any) => {
        let reader = new FileReader()
        reader.readAsDataURL(files[0])
        setFile(files[0])

        reader.onload = () => {
            setPhoto(reader.result as string)
        }

    }

    const style = React.useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [isDragActive, isDragReject, isDragAccept, acceptStyle, activeStyle, baseStyle, rejectStyle])

    const handleSubmit = () => {
        setLoading(true)
        const formData = new FormData();
        formData.append('username', name)
        formData.append('country', country)
        formData.append('gender', gender)
        formatdob && formData.append('dob', formatdob)
        formData.append('about', about)
        formData.append('phone', phone)
        formData.append("photo", file);
        var device = []
        Object.keys(check).forEach(function (key) {
            if (check[key] === true)
                device.push(key)
        });
        formData.append('device', device.toString())
        axios.post(baseUrl + '/update-profile', formData).then(res => {
            if (res.data.status === 200) {
                sessionStorage.setItem('loggeduser', JSON.stringify(res.data.data))
                toast.success(res.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            }
            else {
                toast.error(res.data.data, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            }
            setLoading(false)
        }).catch((e) => {
            toast.error("Network Error", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
            setLoading(false)
        })
    }
    return (
        <>
            <Navbar title={'Profile'} />
            <div className="container">
                <div className="profile-container">
                    <div><h1>Profile</h1> </div>
                    <div className="profile-text">
                        <p>Name</p>
                        <input
                            value={name}
                            type="text"
                            name='name'
                            disabled
                        />
                    </div>
                    <div className="profile-text">
                        <p>Email Id</p>
                        <input
                            value={email}
                            type="text"
                            name='email'
                            disabled
                        />
                    </div>
                    <div className="profile-text">
                        <p>Date of Birth</p>
                        <TextField
                            value={dob}
                            id="date"
                            type="date"
                            className="profile-text input"
                            InputProps={{ disableUnderline: true }}
                            style={{ width: '100%' }}
                            onChange={(e) => {
                                formatdate(new Date(e.target.value)); setdob(e.target.value)
                            }}
                        />
                    </div>
                    <div className="profile-text">
                        <p>Country</p>
                        <input
                            value={country}
                            type="text"
                            name='country'
                            onChange={(e) => setCountry(e.target.value)}
                        />
                    </div>
                    <div className="profile-text">
                        <p>Gender</p>
                        <RadioGroup row name="gender1" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                    </div>
                    <div className="profile-text">
                        <p>Devices</p>
                        <FormGroup aria-label="position" row>
                            <FormControlLabel
                                control={<Checkbox checked={check['Mobile']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }} name="Mobile" />}
                                label="Mobile"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={check['Computer']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }} name="Computer" />}
                                label="Computer"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={check['Tablet']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }} name="Tablet" />}
                                label="Tablet"
                            />
                        </FormGroup>
                    </div>
                    <div className="profile-text">
                        <p>Phone Number</p>
                        <input
                            value={phone}
                            type="text"
                            name='phone'
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="profile-text">
                        <p>Upload Profile Picture</p>
                        <div className="container">
                            <div className="dropzone-outer">
                                <div className="dropzone-inner"{...getRootProps({ style })}>
                                    <input {...getInputProps()} />
                                    <p>Drag 'n' drop, or click to select </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {photo &&
                        <div className="profile-text">
                            <p>Preview</p>
                            <div className="profile-preview"> <Avatar name={name} src={photo} size="300" round={true} color="#009999" />
                            </div>
                        </div>
                    }
                    <div className="profile-text">
                        <p>About</p>
                        <textarea name="description" rows={10}
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}

                        >
                        </textarea>
                    </div>
                    {loading ?
                        <button className="signup-button" disabled  >
                            <CircularProgress />
                        </button> :
                        <button className="signup-button" onClick={() => handleSubmit()} >
                            Update
       </button>
                    }


                </div>
            </div>


        </>
    )
}

export default Profile
