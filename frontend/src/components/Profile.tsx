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
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom'

const countriesList = ['afghanistan', 'akrotiri', 'albania', 'algeria', 'american samoa', 'andorra', 'angola', 'anguilla', 'antarctica', 'antigua and barbuda', 'argentina', 'armenia', 'aruba', 'ashmore and cartier islands', 'australia', 'austria', 'azerbaijan', 'bahamas, the', 'bahrain', 'bangladesh', 'barbados', 'bassas da india', 'belarus', 'belgium', 'belize', 'benin', 'bermuda', 'bhutan', 'bolivia', 'bosnia and herzegovina', 'botswana', 'bouvet island', 'brazil', 'british indian ocean territory', 'british virgin islands', 'brunei', 'bulgaria', 'burkina faso', 'burma', 'burundi', 'cambodia', 'cameroon', 'canada', 'cape verde', 'cayman islands', 'central african republic', 'chad', 'chile', 'china', 'christmas island', 'clipperton island', 'cocos (keeling) islands', 'colombia', 'comoros', 'congo, democratic republic of the', 'congo, republic of the', 'cook islands', 'coral sea islands', 'costa rica', "cote d'ivoire", 'croatia', 'cuba', 'cyprus', 'czech republic', 'denmark', 'dhekelia', 'djibouti', 'dominica', 'dominican republic', 'ecuador', 'egypt', 'el salvador', 'equatorial guinea', 'eritrea', 'estonia', 'ethiopia', 'europa island', 'falkland islands (islas malvinas)', 'faroe islands', 'fiji', 'finland', 'france', 'french guiana', 'french polynesia', 'french southern and antarctic lands', 'gabon', 'gambia, the', 'gaza strip', 'georgia', 'germany', 'ghana', 'gibraltar', 'glorioso islands', 'greece', 'greenland', 'grenada', 'guadeloupe', 'guam', 'guatemala', 'guernsey', 'guinea', 'guinea-bissau', 'guyana', 'haiti', 'heard island and mcdonald islands', 'holy see (vatican city)', 'honduras', 'hong kong', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'isle of man', 'israel', 'italy', 'jamaica', 'jan mayen', 'japan', 'jersey', 'jordan', 'juan de nova island', 'kazakhstan', 'kenya', 'kiribati', 'korea, north', 'korea, south', 'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg', 'macau', 'macedonia', 'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall islands', 'martinique', 'mauritania', 'mauritius', 'mayotte', 'mexico', 'micronesia, federated states of', 'moldova', 'monaco', 'mongolia', 'montserrat', 'morocco', 'mozambique', 'namibia', 'nauru', 'navassa island', 'nepal', 'netherlands', 'netherlands antilles', 'new caledonia', 'new zealand', 'nicaragua', 'niger', 'nigeria', 'niue', 'norfolk island', 'northern mariana islands', 'norway', 'oman', 'pakistan', 'palau', 'panama', 'papua new guinea', 'paracel islands', 'paraguay', 'peru', 'philippines', 'pitcairn islands', 'poland', 'portugal', 'puerto rico', 'qatar', 'reunion', 'romania', 'russia', 'rwanda', 'saint helena', 'saint kitts and nevis', 'saint lucia', 'saint pierre and miquelon', 'saint vincent and the grenadines', 'samoa', 'san marino', 'sao tome and principe', 'saudi arabia', 'senegal', 'serbia and montenegro', 'seychelles', 'sierra leone', 'singapore', 'slovakia', 'slovenia', 'solomon islands', 'somalia', 'south africa', 'south georgia and the south sandwich islands', 'spain', 'spratly islands', 'sri lanka', 'sudan', 'suriname', 'svalbard', 'swaziland', 'sweden', 'switzerland', 'syria', 'taiwan', 'tajikistan', 'tanzania', 'thailand', 'timor-leste', 'togo', 'tokelau', 'tonga', 'trinidad and tobago', 'tromelin island', 'tunisia', 'turkey', 'turkmenistan', 'turks and caicos islands', 'tuvalu', 'uganda', 'ukraine', 'united arab emirates', 'united kingdom', 'united states', 'uruguay', 'uzbekistan', 'vanuatu', 'venezuela', 'vietnam', 'virgin islands', 'wake island', 'wallis and futuna', 'west bank', 'western sahara', 'yemen', 'zambia', 'zimbabwe', 'united states of america', 'usa', 'uk', 'uae', 'gambia']

// import axios from 'axios';
const Profile = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
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
    const [error, setError] = useState({} as any)

    const formatdate = (date: any) => {
        let month = String(date.getMonth() + 1);
        let day = String(date.getDate());
        const year = String(date.getFullYear());
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        var formated = `${day}/${month}/${year}`;
        setformatdob(formated)
    }

    const validate = () => {
        let valid = {} as any
        valid.name = name && name.length > 2 ? /^[a-zA-Z ]*$/.test(name) ? "" : "*Name should contain only alphabets" : "*Name should contain atleast 3 characters"
        valid.about = about && about.length > 0 ? about.length < 501 ? about.length > 30 ? "" : "*About should be greater than 30 characters" : "*About should be within 500 characters" : "* About is required"
        valid.country = country && country.length > 0 ? /^[a-zA-Z ]*$/.test(country) ? countriesList.includes(country.toLowerCase()) ? "" : "*Country name not recogonized" : "*Country name should contain only alphabets" : "*Country name is required"
        valid.phone = phone && phone.length > 0 ? /^\d+$/.test(phone) && phone.length === 10 ? "" : "*Invalid Phone number" : "*Phone number is required"
        return valid;
    }

    useEffect(() => {
        let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
        setUsername(loggeduser['username'])
        setName(loggeduser['name'])
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
        let obj = validate();
        setError(obj);
        if (Object.values(obj).every(item => item === "")) {
            formData.append('username', username)
            formData.append('name', name)
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
                    history.push('/home')

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
        else {
            setLoading(false)
            toast.error("Form has errors", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });

        }
    }
    return (
        <>
            <Helmet>
                <title>Profile</title>
            </Helmet>
            <Navbar title={'Profile'} />
            <div className="container">
                <div className="profile-container">
                    <div><h1>Profile</h1> </div>
                    <div className="profile-text">
                        <p>Username</p>
                        <input
                            className="profile-text-input"
                            value={username}
                            type="text"
                            name='username'
                            id='username'
                            disabled
                        />

                    </div>
                    <div className="profile-text">
                        <p>Email Id</p>
                        <input
                            className="profile-text-input"
                            value={email}
                            type="text"
                            name='email'
                            id='email'
                            disabled
                        />
                    </div>
                    <div className="profile-text">
                        <p>Name*</p>
                        <input
                            className={"profile-text-input " + (error.name ? "input-error" : "")}
                            value={name}
                            type="text"
                            name='name'
                            id= "name"
                            onChange={(e) => setName(e.target.value)}
                        />
                        {error.name && <p className="Error-text"> {error.name}</p>}
                    </div>
                    <div className="profile-text ">
                        <p>Date of Birth</p>
                        <div className="profile-text-input">
                            <TextField
                                value={dob}
                                id="dob"
                                name="dob"
                                type="date"
                                InputProps={{ disableUnderline: true }}
                                style={{ width: '100%', color: "white" }}
                                onChange={(e) => {
                                    formatdate(new Date(e.target.value)); setdob(e.target.value)
                                }}
                            />
                        </div>
                    </div>
                    <div className="profile-text">
                        <p>Country*</p>
                        <input
                            className={"profile-text-input " + (error.country ? "input-error" : "")} value={country}
                            type="text"
                            name='country'
                            id='country'
                            onChange={(e) => setCountry(e.target.value)}
                        />
                        {error.country && <p className="Error-text"> {error.country}</p>}
                    </div>
                    <div className="profile-text">
                        <p>Gender</p>
                        <RadioGroup row name="gender" id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <FormControlLabel value="female" name="female" id="female"  control={<Radio />} label="Female" />
                            <FormControlLabel value="male" name="male" id="male"  control={<Radio />} label="Male" />
                            <FormControlLabel value="other" name="other" id="other"  control={<Radio />} label="Other" />
                        </RadioGroup>
                    </div>
                    <div className="profile-text">
                        <p>Devices</p>
                        <FormGroup aria-label="position" id="devices" row>
                            <FormControlLabel
                                control={<Checkbox name="Mobile" id="Mobile" checked={check['Mobile']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }}  />}
                                label="Mobile"
                            />
                            <FormControlLabel
                                control={<Checkbox name="Computer" id="Computer" checked={check['Computer']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }}  />}
                                label="Computer"
                            />
                            <FormControlLabel
                                control={<Checkbox name="Tablet" id="Tablet" checked={check['Tablet']} onChange={(e) => { setCheck({ ...check, [e.target.name]: e.target.checked }) }}  />}
                                label="Tablet"
                            />
                        </FormGroup>
                    </div>
                    <div className={"profile-text " + (error.phone ? "text-red" : "")}>
                        <p>Phone Number*</p>
                        <input
                            className={"profile-text-input " + (error.phone ? "input-error" : "")}
                            value={phone}
                            type="text"
                            name='phone'
                            id='phone'
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        {error.phone && <p className="Error-text"> {error.phone}</p>}

                    </div>
                    <div className="profile-text">
                        <p>Upload Profile Picture</p>
                        <div className="container">
                            <div className="dropzone-outer">
                                <div className="dropzone-inner"{...getRootProps({ style })}>
                                    <input name="profilepicture" id="profilepicture" {...getInputProps()}/>
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
                        <p>About*</p>
                        <textarea
                            className={"profile-text-textarea " + (error.about ? "input-error" : "")} name="description"
                            rows={10}
                            maxLength={500}
                            value={about}
                            id="description"
                            onChange={(e) => setAbout(e.target.value)}
                        >
                        </textarea>
                        {error.about && <p className="Error-text"> {error.about}</p>}

                    </div>
                    {loading ?
                        <button className="signup-button" name="update" id="update" disabled  >
                            <CircularProgress />
                        </button> :
                        <button className="signup-button" name="update" id="update" onClick={() => handleSubmit()} >
                            Update
       </button>
                    }


                </div>
            </div>


        </>
    )
}

export default Profile
