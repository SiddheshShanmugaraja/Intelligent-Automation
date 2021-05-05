import React, { useState } from 'react'
import '../css/Search.css'
import SearchIcon from '@material-ui/icons/Search';
import Navbar from './Navbar'
import Select from '@material-ui/core/Select';

const Search = () => {
    const [search, setSearch] = useState('');
    const [select, setSelect] = useState({ age: '' })

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
                                value={select['age']}
                                onChange={(e) => setSelect({ ...select, age: "" + e.target.value })}
                                inputProps={{
                                    name: 'age',
                                    id: 'age-native-simple',
                                }}
                                className="search-text-select"
                                placeholder="Select Field"
                            >
                                <option aria-label="None" value="select" />
                                <option value={'Name'}>Country</option>
                                <option value={'Name'}>Name</option>
                                <option value={'Age'}>Age</option>
                                <option value={'Gender'}>Gender</option>

                            </Select>
                        </div>

                    </div>
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
