import React, { Component } from 'react';
import '../assets/css/Project.css'
import Popup from "reactjs-popup";
import { ToastContainer, toast } from 'react-toastify';
import _ from 'lodash'
import { Treebeard } from 'react-treebeard';
import axios from 'axios'
import { baseUrl } from '../config'
import { Helmet } from 'react-helmet-async';
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class TrainingModel extends Component {
    repository = []

    constructor(props) {
        super(props);
        this.state = {
            pageName: "",
            collapseOne: false,
            collapseTwo: false,
            showRightMenu: true,
            showSideBar: false,
            URL: "",
            domainList: [],
            goalList: [],
            value: 0,
            myTreeData: [],
            projectName: "",
            showLoader: true,
            treeData: {},
            galleryItems: [1, 2, 3].map((i) => (<h2 key={i}>{i}</h2>)),
            openEditPopup: false,
            createDomainPopup: false,
            selectors: [""],
            actions: [""],
            terminalState: "",
            mainSelector: "",
            goalDomainName: "",
            optisolbusiness: "",
            goalDomainIndex: 0,
            domainIndex: "",
            pdfBlob: "",
            pageList: [],
            cssSelector: "",
            startUrl: "",
            startUrlType: "",
            domainUrls: [],
            tempPageName: "",
            tempPageUrl: "",
            tempMainSelector: "",
            tempMinorGoal: "",
            selectorName: "minor Goal",
            minorGoal: "",
            getSelector: false,
            trainingStated: false,
            logs: [],
            status: 200,
            trainGoalPopup: false,
            file: {},
            errorType: "",
            loggeduser: {},
        }

    }


    componentDidMount() {
        let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
        this.setState({ loggeduser })
        let formData = new FormData();
        formData.append('username', loggeduser['username'])
        axios.post(baseUrl + '/projects', formData).then(res => {
            if (res.data.status === 200) {
                res.data.data && this.initializeState(res.data.data)
                this.setState({ showLoader: false })
            }
            else {
                toast.error(res.data.message, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }).catch(e => {
            toast.error("Network Error", {
                position: toast.POSITION.TOP_RIGHT
            });

        })
    }
    initializeState = (data) => {
        let domainList = []
        let tree = []
        Object.keys(data.domains).forEach((key, ind) => {
            let Domain = {
                domainName: key,
                domainURL: data.domains[key].crawled_urls.url,
                expand: ind === 0 ? true : false,
                pages: data.domains[key].crawled_urls,
                extractedPage: data.domains[key].crawled_urls,
            }
            domainList.push(Domain)
            tree.push(data.domains[key].crawled_urls)
        })

        let goalList = []
        Object.keys(data.pages).forEach((key, ind) => {
            let selectedPages = []
            data.pages[key].forEach((el) => {
                let temppage = {
                    startUrl: el.url,
                    pageName: el.pageName,
                    terminalState: el.terminalState,
                    selectors: el.selectors,
                    actions: el.actions,
                }
                selectedPages.push(temppage)
            })
            let domainInd = _.findIndex(domainList, { domainName: key })
            let Goal = {
                goalName: data.pages[key][0].goal,
                expand: ind === 0 ? true : false,
                selectedPages: selectedPages,
                goalDomains: domainList[domainInd],
                treeData: domainList[domainInd].pages,
            }
            goalList.push(Goal)

        })
        console.log(domainList, goalList)
        this.setState({ domainIndex: 0, myTreeData: tree, domainList, goalList, currentGoalIndex: 0, collapseOne: true })
    }

    loadUrl = (type) => {
        let domainList = [...this.state.domainList]
        domainList.forEach(element => {
            element.expand = false
        });

        if (this.state.openEditPopup === true) {
            domainList[this.state.domainIndex].domainName = this.state.domainName
            domainList[this.state.domainIndex].domainURL = this.state.URL
            this.setState({
                domainName: "", domainList, openPopup: false, goalDomainIndex: 0, openEditPopup: false,
                projectName: this.state.domainName, startUrl: this.state.URL, collapseOne: true, startUrlType: "domain"
            })

        } else {
            if (!_.find(domainList, { domainName: this.state.domainName })) {
                domainList.unshift({
                    domainName: this.state.domainName, domainURL: this.state.URL, expand: true,
                    pages: [], extractedPage: []
                })
                this.extractSitemap(this.state.URL, domainList)
                this.setState({
                    domainName: "", domainList, openPopup: false, goalDomainIndex: 0, openEditPopup: false, collapseOne: true, pageName: this.state.domainName,
                    projectName: this.state.domainName, startUrl: this.state.URL, domainIndex: 0, mainSelector: "", minorGoal: "", startUrlType: "domain"
                })

            } else {
                toast.error("Domain already exist ", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }
    }

    onToggle = (node, toggled) => {
        const { cursor, myTreeData, domainIndex } = this.state;
        if (cursor) {
            this.setState(() => ({ cursor, active: false }));
        }
        node.active = false;
        if (node.children) {
            node.toggled = toggled;
        }
        const newData = myTreeData;
        newData[domainIndex] = Object.assign({}, newData[domainIndex]);
        this.setState({ goalExpand: false, URL: node.url, startUrl: node.url, pageName: node.name, startUrlType: "domain" }, () => ({ cursor: node, myTreeData: newData }));
    }

    handleChange = (event) => {
        if (event.target.name === "goalDomainName") {
            this.setState({ pageList: [], createDomainPopup: false })
            let goalDomainIndex = _.findIndex(this.state.domainList, { domainName: event.target.value })
            let domainList = this.state.domainList
            if (domainList[goalDomainIndex] && domainList[goalDomainIndex].pages) {
                this.setState({ pageList: domainList[goalDomainIndex].pages, [event.target.name]: event.target.value, createDomainPopup: true })

            } else {
                toast.error("No Pages found for this domain", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
            this.setState({ goalDomainIndex })
        }
        this.setState({ [event.target.name]: event.target.value })
    }

    addSelectors(select, selectpageIndex) {
        if (selectpageIndex > -1) {
            let { goalList, currentGoalIndex } = { ...this.state }
            goalList[currentGoalIndex].selectedPages[selectpageIndex][select].push("")
            this.setState({ goalList })
        }
        else {
            let val = this.state[select]
            val.push("")
            this.setState({ [select]: val })
        }

    }
    deleteSelectors(select, ind, selectpageIndex) {
        if (selectpageIndex > -1) {
            let { goalList, currentGoalIndex } = { ...this.state }
            goalList[currentGoalIndex].selectedPages[selectpageIndex][select].splice(ind, 1)
            this.setState({ goalList })
        }
        else {
            if (ind !== 0) {
                let val = this.state[select]
                val.splice(ind, 1)
                this.setState({ [select]: val })
            }
        }
    }

    handleChangeSelector(e, ind, select, selectpageIndex) {
        if (selectpageIndex > -1) {
            let { goalList, currentGoalIndex } = { ...this.state }
            if (select !== "terminalState") {
                goalList[currentGoalIndex].selectedPages[selectpageIndex][select][ind] = e.target.value
            }
            else {
                goalList[currentGoalIndex].selectedPages[selectpageIndex].terminalState = e.target.value
            }
            this.setState({ goalList })
        }
        else {
            let val = this.state[select]
            if (select !== "terminalState") {
                val[ind] = e.target.value
            }
            else {
                val = e.target.value
            }
            this.setState({ [select]: val })
        }

    }

    bindRepository = (domain) => {
        let obj = { name: domain.domainName, children: domain.pages, domain }
        this.setState({
            pageName: obj.name
        })
    }

    extractSitemap = (domain, domainList) => {
        var formData = new FormData();
        formData.append("domain", domain)
        this.setState({ showLoader: true })
        axios.post(baseUrl + '/get-sites', formData).then(res => {
            if (res.data.status === 200) {
                let treedata = _.cloneDeep(res.data.data)
                let myTreeData = this.state.myTreeData
                myTreeData.unshift(treedata)
                this.setState({ myTreeData: myTreeData, showLoader: false })
                this.getSiteMaps(res.data.data, domain)
            }
            else {
                let treedata = []
                let myTreeData = this.state.myTreeData
                myTreeData.unshift(treedata)
                this.setState({ myTreeData: myTreeData, showLoader: false })
            }

        }).catch(e => {
            toast.error("Api Error Response From /get_sites", {
                position: toast.POSITION.TOP_RIGHT
            });
            let treedata = []
            let myTreeData = this.state.myTreeData
            myTreeData.unshift(treedata)
            this.setState({ myTreeData: myTreeData, showLoader: false })
        })
    }
    getSiteMaps = (myTreeData, domain) => {
        let domainList = this.state.domainList
        let findIndex = _.findIndex(domainList, { domainURL: domain })
        if (findIndex >= 0) {
            domainList[findIndex].pages = myTreeData
            this.bindRepository(domainList[findIndex])
            this.setState({ domainList })
        }
    }

    getDomainPopup = () => {
        return (
            <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                <section className="card">
                    <header className="card-header">
                        <h2 className="card-title ">{this.state.openEditPopup === true ? "Edit Project" : "New Project"}</h2>
                        <b className="close text-right text" onClick={e => { this.setState({ openPopup: false, openEditPopup: false }) }}>
                            &times;
                          </b>
                    </header>
                    <div className="card-body">
                        <form>
                            <div className="form-group">
                                <label htmlFor="inputProjectName">Project Name</label>
                                <input type="text" className="form-control" placeholder="Enter Domain Name" name="domainName" id="domainName"
                                    onChange={e => this.handleChange(e)} value={this.state.domainName} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputDomainURL">Domain / URL</label>
                                <input type="text" className="form-control" placeholder="Enter Domain URL" id="URL"
                                    name="URL" onChange={e => this.handleChange(e)} value={this.state.URL} />
                            </div>
                        </form>
                    </div>
                    <footer className="card-footer">
                        <div className="row">
                            <div className="col-md-12 text-right">
                                <button className="btn btn-primary modal-confirm mr-4" onClick={e => { this.loadUrl() }}>{this.state.openEditPopup === true ? "Update" : "Create"}</button>
                                <button className="btn btn-default modal-dismiss" onClick={e => { this.setState({ openPopup: false, domainName: this.state.projectName }) }}>Cancel</button>
                            </div>
                        </div>
                    </footer>
                </section>
            </div>
        )
    }

    createGoal = () => {
        let { goalDomainIndex, domainList } = { ...this.state }
        domainList.forEach(element => {
            element.expand = false
        });
        let goalList = this.state.goalList
        goalList.forEach(element => {
            element.expand = false
        });
        if (this.state.goalName === "") {
            toast.error("Please enter goal name", {
                position: toast.POSITION.TOP_RIGHT
            });

        } else {
            if (!_.find(goalList, { goalName: this.state.goalName })) {
                let tempObj = {
                    goalName: this.state.goalName,
                    goalDomains: domainList[goalDomainIndex],
                    treeData: domainList[goalDomainIndex].pages,
                    expand: true
                }
                goalList.unshift(tempObj)
                this.setState({
                    currentGoalIndex: 0, goalList, modeUrl: "", mode_name: "", cssSelector: "",
                    goalName: "", goalDomainName: "", goalDomainIndex: 0, pageList: [],
                    showPopup: false, domainUrls: [], pdfBlob: "", openPopup: false, createDomainPopup: false, startUrl: domainList[goalDomainIndex].domainURL, startUrlType: "goal", pageName: "",
                })

            } else {
                toast.error("Goal name already exist", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }


        }
    }

    savePage = (selectpageIndex) => {
        if (selectpageIndex === -1) {
            let { goalList, currentGoalIndex, mainSelector, minorGoal, startUrl, pageName, actions, selectors, terminalState } = { ...this.state }
            let tempPage = {
                startUrl: startUrl,
                pageName: pageName,
                minorGoal: minorGoal,
                mainSelector: mainSelector,
                terminalState: terminalState,
                selectors: selectors,
                actions: actions
            }
            if (goalList[currentGoalIndex].selectedPages) {
                let findIndex = _.findIndex(goalList[currentGoalIndex].selectedPages, { startUrl: startUrl, pageName: pageName })
                if (findIndex >= 0) {
                    goalList[currentGoalIndex].selectedPages[findIndex] = tempPage
                } else {
                    goalList[currentGoalIndex].selectedPages = [...goalList[currentGoalIndex].selectedPages, tempPage]
                }

                this.setState({ goalList })
            } else {
                goalList[currentGoalIndex].selectedPages = [tempPage]
                this.setState({ goalList })
            }
        }
        toast.success("Selectors saved ", {
            position: toast.POSITION.TOP_RIGHT
        });


    }

    expand = (type, index, pageIndex) => {
        let { goalList } = { ...this.state }
        if (type === 'Gaol') {
            goalList.forEach((element, i) => {
                if (i === index) {
                    element.expand = !element.expand
                } else {
                    element.expand = false
                }
            });

        } else {

            let domainList = this.state.domainList
            domainList.forEach((element, index) => {
                if (index !== pageIndex) {
                    element.expand = false
                }
            });
            if (type === "domain") {
                domainList[index].expand = !domainList[index].expand
            } else if (type === "page") {
                domainList[index].pages[pageIndex].expand = !domainList[index].pages[pageIndex].expand
            }
            this.setState({ domainList, goalExpand: false, domainIndex: index })

        }

    }
    selectGoal = (model, goalIndex) => {
        let goalList = this.state.goalList
        let findIndex = _.findIndex(goalList, model)

        goalList.forEach((element, index) => {
            if (findIndex === index) {
                goalList[index].expand = !goalList[index].expand
            } else {
                goalList[index].expand = false
            }
        });
        this.setState({ goalList, currentGoalIndex: findIndex })

    }

    onToggleGoalPage = (node, toggled) => {
        const { gcursor, goalList, currentGoalIndex, goalDomainIndex } = this.state;
        if (gcursor) {
            this.setState(() => ({ gcursor, active: false }));
        }
        node.active = false;
        if (node.children) {
            node.toggled = toggled;
        }

        let goalObj = goalList[currentGoalIndex]
        let pageIndex = _.findIndex(goalObj.selectedPages, { startUrl: node.url, pageName: node.name })
        let mainSelector = ""
        let minorGoal = ""
        let iErrorSelector = ""
        let iSuccessSelector = ""
        if (pageIndex >= 0 && goalObj.selectedPages[pageIndex]) {
            mainSelector = goalObj.selectedPages[pageIndex].mainSelector
            minorGoal = goalObj.selectedPages[pageIndex].minorGoal
            iErrorSelector = goalObj.selectedPages[pageIndex].iErrorSelector
            iSuccessSelector = goalObj.selectedPages[pageIndex].iSuccessSelector
        }
        let newGoalData = goalList[goalDomainIndex];
        newGoalData.treeData = Object.assign({}, newGoalData.treeData);
        this.setState({
            selectors: [""], actions: [""], terminalState: "",
            iSuccessSelector, iErrorSelector,
            mainSelector, minorGoal,
            goalExpand: true,
            URL: node.url,
            startUrl: node.url, pageName: node.name,
            startUrlType: "goal"
        },

            () => ({ gcursor: node, goalList: newGoalData }));
    }

    deletePage = (page, goalIndex, pageIndex) => {

        confirmAlert({
            message: `Are you sure you want to the page '${page.pageName}' ?`,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        const { goalList } = this.state;
                        goalList[goalIndex].selectedPages.splice(pageIndex, 1)
                        this.setState({ goalList })
                    }
                },
                {
                    label: 'No',
                }
            ]
        });

    }
    deleteGoal = (goal, index) => {
        let { goalList, currentGoalIndex, startUrlType } = { ...this.state }
        confirmAlert({
            message: `Are you sure you want to delete the goal '${goal.goalName}' ?`,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        goalList.splice(index, 1)
                        if (index === currentGoalIndex && startUrlType === "goal") {
                            this.setState({ startUrl: "", startUrlType: "", pageName: "", currentGoalIndex: 0 })
                        }
                        this.setState({ goalList })
                    }
                },
                {
                    label: 'No',
                }
            ]
        });
    }
    deleteDomain = (obj, index) => {
        let { domainList, myTreeData, startUrlType, domainIndex, goalList, currentGoalIndex } = { ...this.state }
        confirmAlert({
            message: `Are you sure you want to delete the domain '${domainList[index].domainName}' ? This action will also remove the goals under this domain.`,
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        let list = _.cloneDeep(goalList)
                        let removed = _.remove(goalList, { goalDomains: { domainName: domainList[index].domainName } })
                        let goalindexes = []
                        removed.forEach((ele) => {
                            let temp = _.findIndex(list, { goalName: ele.goalName })
                            if (temp !== -1) {
                                goalindexes.push(temp)
                            }
                        })
                        domainList.splice(index, 1)
                        myTreeData.splice(index, 1)
                        if (index === domainIndex && startUrlType === "domain") {
                            this.setState({
                                URL: "", domainName: "", domainList, openPopup: false, goalDomainIndex: "", openEditPopup: false, goalList,
                                projectName: "", startUrl: "", startUrlType: "", pageName: "", domainIndex: 0, mainSelector: "", minorGoal: "", iErrorSelector: "", iSuccessSelector: ""
                            })
                        }
                        else if (currentGoalIndex in goalindexes && startUrlType === "goal") {
                            this.setState({ startUrl: "", startUrlType: "", pageName: "", domainList, goalList, currentGoalIndex: 0 })

                        }
                        else {
                            this.setState({ domainList, goalList })
                        }
                    }
                },
                {
                    label: 'No',
                }
            ]
        });

    }

    trainData = (data) => {
        let loggeduser = this.state.loggeduser
        let selector = []
        if (data.selectedPages && data.selectedPages.length > 0) {
            data.selectedPages.forEach((ele) => {
                let tempobj = {
                    actions: ele.actions,
                    selectors: ele.selectors,
                    terminalState: ele.terminalState,
                    url: ele.startUrl,
                    pageName: ele.pageName,
                    goal: data.goalName,
                }
                selector.push(tempobj)
            })
            let jsonData = {
                projectName: data.goalDomains.domainName,
                data: selector,
                username: loggeduser['username'],
            }
            console.log(jsonData)
            axios.post(baseUrl + '/train', jsonData).then(res => {
                console.log(res)
                if (res.data.status === 200) {
                    toast.success(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                }
                else {
                    toast.error(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 3000,
                    });
                }
            }).catch((e) => {
                console.log(e)
                toast.error("Network Error", {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 3000,
                });
            })

        }
        else {
            toast.error("Error No Pages Selected", {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });

        }

    }

    render() {
        const { goalExpand, showLoader, goalList, currentGoalIndex, startUrl, pageName } = { ...this.state }
        let selectpageIndex = (_.findIndex(goalList[currentGoalIndex]?.selectedPages, { startUrl: startUrl, pageName: pageName }))
        return (
            <div className="container-fluid">
                <Helmet>
                    <title>Project</title>
                </Helmet>
                { showLoader &&
                    <div class="loading">
                        <Loader className="spinner" type="Oval" color="#00BFFF" height={100} width={100} />
                    </div>}
                <Popup className="custom-modal"
                    open={this.state.openPopup}
                    closeOnDocumentClick={false}
                    onClose={e => this.setState({ openPopup: false })}
                >
                    {this.getDomainPopup()}
                </Popup>
                <Popup className="custom-modal"
                    open={this.state.createDomainPopup}
                    closeOnDocumentClick={false}
                    onClose={e => this.setState({ createDomainPopup: false })}
                >
                    <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                        <section className="card">
                            <header className="card-header">
                                <h2 className="card-title ">Create Goal</h2>
                                <b className="close text-right text" onClick={e => { this.setState({ createDomainPopup: false }) }}>
                                    &times;
                          </b>
                            </header>
                            <div className="card-body">
                                <form>
                                    <label htmlFor="inputProjectName">Goal Name</label>
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder=" Enter Goal Name" id="goalName"
                                            name="goalName" onChange={e => this.handleChange(e)} value={this.state.goalName} />
                                    </div>
                                </form>
                                <form>
                                    <label htmlFor="inputProjectName">Select Domain</label>
                                    <div className="form-group">
                                        <select name="goalDomainName" value={this.state.goalDomainName} onChange={e => this.handleChange(e)} className="form-control" >
                                            <option value="" disabled hidden>Choose here</option>
                                            {this.state.domainList && this.state.domainList.map((obj, index) =>
                                                <option key={index} value={obj.domainName}>{obj.domainName}</option>
                                            )}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <footer className="card-footer">
                                <div className="row">
                                    <div className="col-md-12 text-right">
                                        <button className="btn btn-primary modal-confirm mr-4" onClick={e => { this.createGoal() }}>Save</button>
                                        <button className="btn btn-default modal-dismiss" onClick={e => { this.setState({ openPopup: false, createDomainPopup: false, getSelector: false }) }}>Cancel</button>
                                    </div>
                                </div>
                            </footer>
                        </section>
                    </div>
                </Popup>
                <div >
                </div>
                <section className="content-with-menu content-with-menu-has-toolbar">
                    <div className="content-with-menu-container">
                        <menu id="content-menu" className={"inner-menu " + (this.props.showMenu ? '' : '')} role="menu">
                            <div className={"nano has-scrollbar "}>
                                <div className="nano-content navi-list" tabIndex="0">
                                    <div className="inner-menu-content">
                                        <div className="sidebar-widget m-0">
                                            <div className="widget-content">

                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-white text-center border-bottom">
                                        <label className="b h5 list-heading" > DOMAIN REPOSITORY</label>
                                    </div>
                                    {this.state.domainList.length > 0 ? <nav id="menu" className="px-3 nav-main" role="navigation">
                                        {this.state.domainList.map((object, index) =>
                                            <ul key={index} className="mt-1 text-white">

                                                <li className="b  list-none position-relative" >
                                                    <i className={"far align-i " + (object.expand ? 'fa-minus-square' : 'fa-plus-square')}
                                                        onClick={e => { this.expand("domain", index, object) }} ></i>
                                                    <label className="c-pointer ml-1 align-label d-inline-flex"
                                                    >
                                                        <span className={"text-truncate w-207 d-block " + (this.state.domainIndex === index ? "selected-repo" : "")}
                                                            onClick={e => { this.expand("domain", index, object) }}>{object.domainName}</span>
                                                        <span className="btn btn-danger btn-xs d-inline ml-1 mr-1 " onClick={() => { this.deleteDomain(object, index) }}>  <i className="fas fa-trash-alt text-default "></i></span>
                                                    </label>
                                                </li>
                                                {object.expand ?
                                                    this.state.myTreeData[index] &&
                                                    <Treebeard
                                                        key={index}
                                                        id={index}
                                                        onClick={e => { this.setState({ domainIndex: index }) }}
                                                        data={this.state.myTreeData[index]}
                                                        onToggle={this.onToggle} />
                                                    : null}
                                            </ul>
                                        )}
                                    </nav> : null}
                                    {this.state.goalList.length > 0 ?
                                        <nav id="menu" className="nav-main mt-5 " role="navigation">
                                            <div className="mt-2 text-white text-center border-white">
                                                <label className="b h5 list-heading" > GOAL REPOSITORY</label>
                                            </div>
                                            {this.state.goalList.length > 0 && <nav id="menu" className="px-3 nav-main" role="navigation">
                                                {this.state.goalList.map((goal, index) =>
                                                    <ul key={index} className="mt-1 text-white">

                                                        <li className="list-none position-relative">

                                                            <i className={"far align-i " + (goal.expand === true ? 'fa-minus-square' : 'fa-plus-square')} onClick={e => { this.selectGoal(goal, index) }}></i>
                                                            <label className={"c-pointer ml-1 align-label d-inline-flex " + (this.state.currentGoalIndex === index ? "selected-repo" : "")} onClick={e => { this.setState({ goalIndex: index, openGoal: true }, () => { this.selectGoal(goal, index) }) }} > {goal.goalName}
                                                            </label>
                                                            <button className="btn btn-success btn-xs d-inline ml-1" onClick={() => { this.setState({ currentGoal: goal }); this.trainData(goal) }}> Train</button>
                                                            <button className="ml-1 btn btn-danger btn-xs d-inline mr-1 " onClick={() => { this.deleteGoal(goal, index) }}>  <i className="fas fa-trash-alt text-default "></i></button>
                                                        </li>
                                                        {goal.expand === true ?
                                                            <div>
                                                                <span className="pt-1 pb-1 mt-1 text-center">
                                                                    {goal.selectedPages && goal.selectedPages.map((page, pageIndex) =>
                                                                        <form classname="position-relative tm-form c-pointer   w-100">
                                                                            <div class="btn-group mt-1 w-80" role="group" aria-label="Basic example">
                                                                                <button type="button" class="btn btn-default w-80 overflow-hidden" onClick={e => {
                                                                                    this.setState({
                                                                                        mainSelector: page.mainSelector,
                                                                                        minorGoal: page.minorGoal,
                                                                                        iErrorSelector: page.iErrorSelector,
                                                                                        iSuccessSelector: page.iSuccessSelector,
                                                                                        startUrl: page.startUrl, pageName: page.pageName,
                                                                                        startUrlType: "goal",
                                                                                        goalExpand: true
                                                                                    })
                                                                                }}><span className="text-wrap">{page.pageName}</span></button>
                                                                                <button type="button" class="btn btn-secondary" onClick={e => { this.deletePage(page, index, pageIndex) }}><i class="fas fa-trash fas-lg"></i></button>
                                                                            </div>
                                                                        </form>
                                                                    )}
                                                                </span>
                                                                <div className="mt-2">
                                                                    <Treebeard
                                                                        key={index}
                                                                        id={index}
                                                                        onClick={e => { this.setState({ goalDomainIndex: index }) }}
                                                                        data={goal.treeData}
                                                                        onToggle={this.onToggleGoalPage} />
                                                                </div>
                                                            </div> : null}
                                                    </ul>
                                                )}
                                            </nav>}
                                        </nav> : null}
                                </div>
                                <div className="nano-pane" style={{ 'opacity': '1', 'visibility': 'visible', 'display': 'none' }}><div className="nano-slider" style={{ height: '200px', 'transform': 'translate(0px, 0px)' }}></div></div></div>
                        </menu>

                        <div className="inner-body mg-main">
                            <div className={'inner-toolbar clearfix'} >

                                <ul>
                                    <li className="c-pointer" onClick={e => this.setState({ openPopup: true, domainName: "", URL: "" })}>
                                        <i className="fas fa-plus mr-1 text-success" aria-hidden="true" ></i > <span className="text-white "  >New Project</span>
                                    </li>
                                    <li className="mr-2 c-pointer" onClick={e => this.setState({ createDomainPopup: true })} >
                                        <i className="fas fa-plus mr-1 text-info" aria-hidden="true" ></i > <span className="text-white "  >Create Goal</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    {this.state.startUrl &&
                                        <section className="">
                                            <div className="row">
                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                                    <section id="accordionExample">
                                                        <div className="card card-featured card-featured-primary accordion">
                                                            <div className="card-header bg-white c-pointer py-1 px-3" id="headingOne" data-toggle="collapse" name="collapseOne" onClick={() => { this.setState({ collapseOne: !this.state.collapseOne }) }} data-target="#collapseOne"
                                                                aria-controls="collapseOne">
                                                                <h4 className="m-0 fs18">
                                                                    <span data-toggle="tooltip" title={this.state.startUrl}  >{this.state.pageName ? this.state.pageName : this.state.startUrl}</span>
                                                                    <span className="pull-right "><i className={this.state.collapseOne ? "fas fa-chevron-up" : "fas fa-chevron-down"} aria-hidden="true"></i></span>

                                                                </h4>
                                                            </div>
                                                            <div id="collapseOne" className={"card-body collapse" + (this.state.collapseOne ? 'show' : "")} aria-labelledby="headingOne" data-parent="#accordionExample">
                                                                <div className="row">
                                                                    <div className="col-12 text-center">
                                                                        {this.state.startUrl !== "" ?
                                                                            <div className="form-row">
                                                                                {goalExpand && this.state.startUrlType === "goal" ?
                                                                                    <div className="col-md-12">
                                                                                        <span className='col-md-12 h5'> Please Add Page Properties</span>
                                                                                        <div className="row row">
                                                                                            <div className="col-md-6 row p-0">
                                                                                                <div className="col-6">
                                                                                                    {
                                                                                                        (selectpageIndex && selectpageIndex) > -1 ?
                                                                                                            goalList[currentGoalIndex].selectedPages[selectpageIndex].selectors.map((ele, n) =>
                                                                                                                <div className="mt-2">
                                                                                                                    <input type="text" className="form-control  col-md-8 d-inline  " placeholder="Main  Selector" id="mainSelector"
                                                                                                                        name="mainSelector" onChange={e => this.handleChangeSelector(e, n, "selectors", selectpageIndex)} value={goalList[currentGoalIndex].selectedPages[selectpageIndex].selectors[n]} />
                                                                                                                    {n === 0 ? <span className="btn btn-success col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.addSelectors("selectors", selectpageIndex) }}>  <i className="fas fa-plus text-default "></i></span>
                                                                                                                        : <span className="btn btn-danger col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.deleteSelectors("selectors", n, selectpageIndex) }} >  <i className="fas fa-minus text-default "></i></span>}

                                                                                                                </div>
                                                                                                            ) :
                                                                                                            this.state.selectors && this.state.selectors.map((ele, n) =>
                                                                                                                <div className="mt-2">
                                                                                                                    <input type="text" className="form-control  col-md-8 d-inline  " placeholder="Main  Selector" id="mainSelector"
                                                                                                                        name="mainSelector" onChange={e => this.handleChangeSelector(e, n, "selectors")} value={this.state.selectors[n]} />
                                                                                                                    {n === 0 ? <span className="btn btn-success col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.addSelectors("selectors") }}>  <i className="fas fa-plus text-default "></i></span>
                                                                                                                        : <span className="btn btn-danger col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.deleteSelectors("selectors", n) }} >  <i className="fas fa-minus text-default "></i></span>}

                                                                                                                </div>
                                                                                                            )
                                                                                                    }
                                                                                                </div>
                                                                                                <div className="col-6">
                                                                                                    {
                                                                                                        (selectpageIndex && selectpageIndex) > -1 ?
                                                                                                            goalList[currentGoalIndex].selectedPages[selectpageIndex].actions.map((ele, n) =>
                                                                                                                <div className="mt-2">
                                                                                                                    <input type="text" className="form-control  col-md-8 d-inline  " placeholder="Action" id="mainSelector"
                                                                                                                        name="mainSelector" onChange={e => this.handleChangeSelector(e, n, "actions", selectpageIndex)} value={goalList[currentGoalIndex].selectedPages[selectpageIndex].actions[n]} />
                                                                                                                    {n === 0 ? <span className="btn btn-success col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.addSelectors("actions", selectpageIndex) }}>  <i className="fas fa-plus text-default "></i></span>
                                                                                                                        : <span className="btn btn-danger col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.deleteSelectors("actions", n, selectpageIndex) }} >  <i className="fas fa-minus text-default "></i></span>}

                                                                                                                </div>
                                                                                                            ) :
                                                                                                            this.state.selectors && this.state.actions.map((ele, n) =>
                                                                                                                <div className="mt-2">
                                                                                                                    <input type="text" className="form-control  col-md-8 d-inline  " placeholder="Action" id="mainSelector"
                                                                                                                        name="mainSelector" onChange={e => this.handleChangeSelector(e, n, "actions")} value={this.state.actions[n]} />
                                                                                                                    {n === 0 ? <span className="btn btn-success col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.addSelectors("actions") }}>  <i className="fas fa-plus text-default "></i></span>
                                                                                                                        : <span className="btn btn-danger col-md-2 d-inline ml-1 mr-1 " onClick={() => { this.deleteSelectors("actions", n) }} >  <i className="fas fa-minus text-default "></i></span>}

                                                                                                                </div>
                                                                                                            )
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-md-6">
                                                                                                {selectpageIndex > -1 ?
                                                                                                    <input type="text" className="form-control  col-md-5 d-inline ml-1 " placeholder="Terminal State" id="terminalState"
                                                                                                        name="terminalState" onChange={e => this.handleChangeSelector(e, -1, "terminalState", selectpageIndex)} value={goalList[currentGoalIndex].selectedPages[selectpageIndex].terminalState} />
                                                                                                    : <input type="text" className="form-control  col-md-5 d-inline ml-1 " placeholder="Terminal State" id="terminalState"
                                                                                                        name="terminalState" onChange={e => this.handleChangeSelector(e, -1, "terminalState")} value={this.state.terminalState} />}
                                                                                                <button className="btn btn-success col-md-3 ml-1" onClick={e => { this.savePage(selectpageIndex) }}>Save</button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    : null}

                                                                                <iframe className="col-12  mt-2 h-490px text-center" title="iframe loader" id="framLoader" style={{ height: "500px" }}
                                                                                    type="text/html" src={this.state.startUrl}
                                                                                >
                                                                                </iframe>

                                                                            </div>

                                                                            : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                    <div className="col-12">
                                                        <section className="card">
                                                        </section>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <ToastContainer />
            </div>
        );
    }
}

export default TrainingModel