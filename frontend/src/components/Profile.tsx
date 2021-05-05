import React, { useState, useEffect } from "react";
import '../css/Profile.css'
import Navbar from './Navbar'
import { TextField } from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Select from '@material-ui/core/Select';
import { useDropzone } from 'react-dropzone';


// import axios from 'axios';
const Profile = () => {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [country, setCountry] = useState('')
    const [dob, setdob] = useState('')
    const [gender, setGender] = useState('')
    const [description, setDescription] = useState('')
    const [phone, setPhone] = useState('202-555-0173')
    const [check, setCheck] = React.useState({
        Mobile: false,
        Computer: false,
        Tablet: false,
    });
    const [select, setSelect] = useState({ age: '' })



    useEffect(() => {
        // axios.get(baseUrl + '/profile-details', userid).then(res => {
        //     if (res.data.status === 200) {
        //     }
        // )
        setEmail('andy@campbells.com')
        setName("Andy Warhol")
        setCountry("United States of America")
        setdob('1928-08-06')
        setGender('male')
        setSelect({ age: "Above 35" })
        setDescription("Andy Warhol was an American artist, film director, and producer who was a leading figure in the visual art movement known as pop art.")
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
        borderColor: '#2196f3'
    }), []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: 'image/*',
        onDrop: files => console.log(files)
    });

    const style = React.useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [isDragActive, isDragReject, isDragAccept, acceptStyle, activeStyle, baseStyle, rejectStyle])


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
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="profile-text">
                        <p>Email Id</p>
                        <input
                            value={email}
                            type="text"
                            name='email'
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={(e) => setdob(e.target.value)}
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
                        <p>Age</p>
                        <Select
                            native
                            value={select['age']}
                            onChange={(e) => setSelect({ ...select, age: "" + e.target.value })}
                            inputProps={{
                                name: 'age',
                                id: 'age-native-simple',
                            }}
                            className="profile-text-select"

                        >
                            <option aria-label="None" value="select" />
                            <option value={'under 18'}>Under 18</option>
                            <option value={'18-25'}>18-25</option>
                            <option value={'25-30'}>25-30</option>
                            <option value={'30-35'}>30-35</option>
                            <option value={'Above 35'}>Above 35</option>
                        </Select>
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
                        <p>Upload</p>
                        <div className="container">
                            <div className="dropzone-outer">
                                <div className="dropzone-inner"{...getRootProps({ style })}>
                                    <input {...getInputProps()} />
                                    <p>Drag 'n' drop, or click to select </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-text">
                        <p>About</p>
                        <textarea name="description" rows={10}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}

                        >
                        </textarea>
                    </div>
                    <button className="signup-button" >
                        Update
          </button>

                </div>
            </div>


        </>
    )
}

export default Profile
