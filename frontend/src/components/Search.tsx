import React, { useState, useEffect } from 'react'
import '../assets/css/Search.css'
import SearchIcon from '@material-ui/icons/Search';
import Navbar from './Navbar'
import Select from '@material-ui/core/Select';
import Avatar from 'react-avatar'
import _ from 'lodash'
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Sort from '@material-ui/icons/UnfoldMore';
import { baseUrl } from "../config"
const Search = () => {
    const [search, setSearch] = useState('');
    const [select, setSelect] = useState({ field: '' })
    const [type, setType] = useState(true)
    const [field, setField] = useState('id')
    var [table_values, setTable_values] = useState([] as any);


    useEffect(() => {
        const res = {
            "data": [
                {
                    "id": 1,
                    "username": "zadmin",
                    "email": "admin@gmail.com",
                    "dob": "2021-05-05",
                    "gender": "male",
                    "device": null,
                    "phone": null,
                    "about": null,
                    "photo": "static/profile_pictures/default.jpg",
                    "is_admin": true,
                    "projects": ["Project1", "Project2", "Project3"]
                },

                {
                    "id": 2,
                    "username": "user",
                    "email": "user@gmail.com",
                    "dob": "2004-05-05",
                    "gender": "female",
                    "device": "tablet",
                    "phone": "123-456-7890",
                    "about": null,
                    "photo": "static/profile_pictures/user.jpg",
                    "is_admin": false,
                    "projects": ["Project4", "Project5", "Project6"]
                },
                {
                    "id": 3,
                    "username": "user",
                    "email": "user@gmail.com",
                    "dob": "2010-05-05",
                    "gender": "female",
                    "device": "tablet",
                    "phone": "123-456-7890",
                    "about": null,
                    "photo": "static/profile_pictures/user.jpg",
                    "is_admin": false,
                    "projects": ["Project4", "Project5", "Project6"]
                }

            ]

        }
        if (type) {
            setTable_values(_.orderBy(res['data'], [field], ['asc']));
        }
        else {
            setTable_values(_.orderBy(res['data'], [field], ['desc']));
        }
    }, [field, type]);



    const sortTable = (f: any) => {
        if (f !== field) {
            setType(true)

        }
        else {
            setType(!type)

        }
        setField(f)
    }

    return (
        <>
            <Navbar title={'Search'} />
            <div className="task-management-container">
                <div className="search-management-header">
                    <p>Search</p>
                    <div className="task-management-header-right-items">
                        <div className="search-management-search">
                            <SearchIcon />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" />
                            <Select
                                native
                                value={select['field']}
                                onChange={(e) => setSelect({ field: "" + e.target.value })}
                                inputProps={{
                                    name: 'age',
                                    id: 'select',
                                }}
                                id="select"
                                className="search-text-select"
                                placeholder="Select Field"
                            >
                                <option value="" disabled>Select Field</option>
                                <option value={'Username'}>Username</option>
                                <option value={'Email'}>Email</option>
                                <option value={'UserID'}>UserID</option>
                            </Select>
                        </div>
                        <button className="search-button">Search</button>
                    </div>
                </div>
                <div className="task-management-body">

                    <table>
                        <thead>
                            <tr>
                                <th className={field === 'id' ? "selected" : "cpointer"} onClick={() => sortTable('id')}>id {field === 'id' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />} </th>
                                <th className={field === 'username' ? "selected" : "cpointer"} onClick={() => sortTable('username')}>username{field === 'username' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th className={field === 'email' ? "selected" : "cpointer"} onClick={() => sortTable('email')}>email{field === 'email' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th className={field === 'dob' ? "selected" : "cpointer"} onClick={() => sortTable('dob')} >dob{field === 'dob' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th className={field === 'gender' ? "selected" : "cpointer"} onClick={() => sortTable('gender')}>gender{field === 'gender' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th className={field === 'device' ? "selected" : "cpointer"} onClick={() => sortTable('device')}>device{field === 'device' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th>phone</th>
                                <th>photo</th>
                                <th className={field === 'is_admin' ? "selected" : "cpointer"} onClick={() => sortTable('is_admin')}>is_admin{field === 'is_admin' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                <th>projects</th>
                            </tr></thead>
                        <tbody>
                            {table_values.map(arr =>
                                <tr key={arr.id}>
                                    <td className={field === 'id' ? "selected-values" : ""}>{arr.id}</td>
                                    <td className={field === 'username' ? "selected-values" : ""}>{arr.username}</td>
                                    <td className={field === 'email' ? "selected-values" : ""}>{arr.email}</td>
                                    <td className={field === 'dob' ? "selected-values" : ""}>{arr.dob}</td>
                                    <td className={field === 'gender' ? "selected-values" : ""}>{arr.gender}</td>
                                    <td className={field === 'device' ? "selected-values" : ""}>{arr.device}</td>
                                    <td >{arr.phone}</td>
                                    <td>
                                        <Avatar name={arr.username} src={baseUrl + "/" + arr.photo} size="40" round={true} color="#009999" />
                                    </td>
                                    <td className={field === 'is_admin' ? "selected-values" : ""}>{arr.is_admin.toString()}</td>
                                    <td>{arr.projects}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

export default Search
