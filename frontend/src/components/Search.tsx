import React, { useState, useEffect } from 'react'
import '../assets/css/Search.css'
import SearchIcon from '@material-ui/icons/Search';
import Navbar from './Navbar'
import Select from '@material-ui/core/Select';
import Avatar from 'react-avatar'
import _ from 'lodash'
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Send from '@material-ui/icons/Send';
import Sort from '@material-ui/icons/UnfoldMore';
import { baseUrl } from "../config"
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';

const Search = () => {
    const [search, setSearch] = useState('');
    const [select, setSelect] = useState({ field: '' })
    const [data, setData] = useState({})
    const [type, setType] = useState(true)
    const [field, setField] = useState('id')
    const [max, setMax] = useState('')
    var [table_values, setTable_values] = useState([] as any);
    const setInitalState = () => {
        let credit = JSON.parse(sessionStorage.getItem('credit') || '0')
        setMax(credit)
        axios.get(baseUrl + '/search').then(res => {
            if (res.data.status === 200) {
                setData(res.data.data)
            }
            else {
                toast.error(res.data.message, {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            }
        }).catch((e) => {
            toast.error("Network Error", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        })
    }
    useEffect(() => {
        setInitalState()
    }, [])

    useEffect(() => {
        if (type) {
            setTable_values(_.orderBy(data, [field], ['asc']));
        }
        else {
            setTable_values(_.orderBy(data, [field], ['desc']));
        }
    }, [field, type, data]);

    const sortTable = (f: any) => {
        if (f !== field) {
            setType(true)

        }
        else {
            setType(!type)

        }
        setField(f)
    }

    const onClear = () => {
        setSearch('')
        setSelect({ field: '' })
        setInitalState()
        setField('id')
        setType(true)
    }

    const onSearch = () => {
        if (search && select['field']) {
            const formData = new FormData();
            formData.append('search_keyword', search)
            formData.append('search_field', select['field'])
            axios.post(baseUrl + '/search', formData).then(res => {
                if (res.data.status === 200) {
                    setField('id')
                    setType(true)
                    setData(res.data.data)
                }
                else {
                    toast.error(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                }
            }).catch((e) => {
                toast.error("Network Error", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            })
        }
        else {
            if (!search)
                toast.error("Please Enter the search keyword", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            else if (!select['field'])
                toast.error("Please Select the search field", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
        }
    }

    const handleTransfer = (recv_user, id) => {
        let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
        let send_user = loggeduser['username']
        let input = document.getElementById(id)
        let amount = (input as HTMLFormElement).value
        if (amount <= max) {
            const formData = new FormData();
            formData.append('sender_username', send_user)
            formData.append('reciever_username', recv_user)
            formData.append('amount', amount)
            axios.post(baseUrl + '/transfer-credits', formData).then(res => {
                if (res.data.status === 200) {
                    toast.success(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                    sessionStorage.setItem('credit', JSON.stringify(res.data.data.sender.credit))
                    setMax(res.data.data.sender.credit)
                    setInitalState()
                    let form = document.getElementById('form')
                    if (form) (form as HTMLFormElement).reset();
                }
                else {
                    toast.error(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                }

            }).catch((e) => {
                toast.error("Network Error", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            })

        }
        else {
            toast.error("Insufficient Credits", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        }

    }

    return (
        <>
            <Helmet>
                <title>Search</title>
            </Helmet>
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
                                onChange={(e) => setSelect({ field: e.target.value.toString() })}
                                inputProps={{
                                    name: 'age',
                                    id: 'select',
                                }}
                                id="select"
                                className="search-text-select"
                                placeholder="Select Field"
                            >
                                <option value="" disabled>Select Field</option>
                                <option value={'Id'}>Id</option>
                                <option value={'Username'}>Username</option>
                                <option value={'Email'}>Email</option>
                                {/* <option value={'UserID'}>UserID</option> */}
                                {/* <option value={'Age'}>Age</option> */}
                                <option value={'Country'}>Country</option>
                                <option value={'Gender'}>Gender</option>
                                <option value={'Device'}>Device</option>
                                <option value={'Phone'}>Phone</option>
                                <option value={'About'}>About</option>
                            </Select>
                        </div>
                        <button className="search-button" onClick={() => onSearch()}>Search</button>
                        <button className="search-button" onClick={() => onClear()}>Clear</button>
                    </div>
                </div>
                <div className="task-management-body">
                    <p>Credit Available: {max}</p>
                    <form id='form'>
                        <table>
                            <thead>
                                <tr>
                                    <th className={field === 'id' ? "selected" : "cpointer"} onClick={() => sortTable('id')}>id {field === 'id' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />} </th>
                                    <th className={field === 'username' ? "selected" : "cpointer"} onClick={() => sortTable('username')}>username{field === 'username' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th className={field === 'email' ? "selected" : "cpointer"} onClick={() => sortTable('email')}>email{field === 'email' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th className={field === 'credit' ? "selected" : "cpointer"} onClick={() => sortTable('credit')}>credits{field === 'credit' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th className={field === 'age' ? "selected" : "cpointer"} onClick={() => sortTable('age')} >age{field === 'age' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th className={field === 'gender' ? "selected" : "cpointer"} onClick={() => sortTable('gender')}>gender{field === 'gender' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th className={field === 'device' ? "selected" : "cpointer"} onClick={() => sortTable('device')}>device{field === 'device' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th>phone</th>
                                    <th>photo</th>
                                    <th className={field === 'is_admin' ? "selected" : "cpointer"} onClick={() => sortTable('is_admin')}>is_admin{field === 'is_admin' ? type ? <ExpandMore /> : <ExpandLess /> : <Sort />}</th>
                                    <th>Transfer Credits</th>
                                </tr></thead>
                            <tbody>
                                {table_values && table_values.length > 0 ? table_values.map(arr =>
                                    <tr key={arr.id}>
                                        <td className={field === 'id' ? "selected-values" : ""}>{arr.id}</td>
                                        <td className={field === 'username' ? "selected-values" : ""}>{arr.username}</td>
                                        <td className={field === 'email' ? "selected-values" : ""}>{arr.email}</td>
                                        <td className={field === 'credit' ? "selected-values" : ""}>{arr.credit}</td>
                                        <td className={field === 'age' ? "selected-values" : ""}>{arr.age}</td>
                                        <td className={field === 'gender' ? "selected-values" : ""}>{arr.gender}</td>
                                        <td className={field === 'device' ? "selected-values" : ""}>{arr.device.toString()}</td>
                                        <td >{arr.phone}</td>
                                        <td>
                                            <Avatar name={arr.username} src={baseUrl + "/" + arr.photo} size="40" round={true} color="#009999" />
                                        </td>
                                        <td className={field === 'is_admin' ? "selected-values" : ""}>{arr.is_admin.toString()}</td>
                                        <td>
                                            <input
                                                className="transfer-credits"
                                                type="number"
                                                name='credits'
                                                defaultValue={''}
                                                id={arr.id}
                                            />
                                            <Send onClick={() => handleTransfer(arr.username, arr.id)} />
                                        </td>
                                    </tr>
                                ) :
                                    <tr>
                                        <td colSpan={11} >No data found</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Search
