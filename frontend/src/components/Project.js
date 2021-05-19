import React, { Component } from 'react';
import '../assets/css/Project.css'
import "react-alice-carousel/lib/alice-carousel.css";
import Popup from "reactjs-popup";
import { ToastContainer, toast } from 'react-toastify';
import _ from 'lodash'
import { Treebeard } from 'react-treebeard';
import axios from 'axios'
import { baseUrl } from '../config'
import { Helmet } from 'react-helmet';

// let selectedUrl = []
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
            showLoader: false,
            treeData: {},
            galleryItems: [1, 2, 3].map((i) => (<h2 key={i}>{i}</h2>)),
            openEditPopup: false,
            createDomainPopup: false,
            mainSelector: "",
            goalDomainName: "",
            optisolbusiness: "",
            goalDomainIndex: "",
            domainIndex: "",
            pdfBlob: "",
            pageList: [],
            cssSelector: "",
            startUrl: "",
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
            GoalTreeData: "",

        }

    }
    componentDidMount() {
        // for(let i=1;i<=100;i++){

        //      console.log(i);
        // }

    }

    loadUrl = (type) => {
        let domainList = [...this.state.domainList]
        domainList.forEach(element => {
            element.expand = false
        });

        if (this.state.openEditPopup === true) {
            domainList[this.state.domainIndex].domainName = this.state.domainName
            domainList[this.state.domainIndex].domainURL = this.state.URL
            this.state.treeData.name = this.state.domainName
            this.setState({
                URL: "", domainName: "", domainList, openPopup: false, goalDomainIndex: "", openEditPopup: false,
                projectName: this.state.domainName, startUrl: this.state.URL, collapseOne: true
            })

        } else {
            if (!_.find(domainList, { domainName: this.state.domainName })) {
                domainList.unshift({
                    domainName: this.state.domainName, domainURL: this.state.URL, expand: true,
                    pages: [], extractedPage: []
                })
                this.extractSitemap(this.state.URL, domainList)
                this.setState({
                    URL: "", domainName: "", domainList, openPopup: false, goalDomainIndex: "", openEditPopup: false, collapseOne: true,
                    projectName: this.state.domainName, startUrl: this.state.URL, domainIndex: 0, mainSelector: "", minorGoal: ""
                })
                // this.props.updateUrlElement(domainList)

            } else {
                toast.error("Domain already exist ", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        }
        // this.props.loadUrl({ url: this.state.startUrl, domainName: this.state.projectName })
    }

    onToggle = (node, toggled) => {
        console.log(node, toggled)
        const { cursor, myTreeData } = this.state;
        if (cursor) {
            this.setState(() => ({ cursor, active: false }));
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({ goalExpand: false, URL: node.url, startUrl: node.url, pageName: node.name }, () => ({ cursor: node, myTreeData: Object.assign({}, myTreeData) }));
    }

    handleChange = (event) => {
        if (event.target.name === "goalDomainName") {
            this.setState({ pageList: [], createDomainPopup: false })

            let goalDomainIndex = _.findIndex(this.state.domainList, { domainName: event.target.value })
            let data = []
            let domainList = this.state.domainList
            domainList[goalDomainIndex].pages = ["http://localhost:3000/", "http://localhost:3000/sign-up", "http://localhost:3000/login"]

            console.log(domainList[goalDomainIndex].pages)
            if (domainList[goalDomainIndex] && domainList[goalDomainIndex].pages.length > 0) {
                domainList[goalDomainIndex].pages.forEach(element => {
                    data.push({ name: element.pageName, value: element.pageName, element })
                });
                this.setState({ pageList: data, [event.target.name]: event.target.value, createDomainPopup: true })

            } else {
                toast.error("No Pages found for this domain", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
            this.setState({ goalDomainIndex })
        }
        this.setState({ [event.target.name]: event.target.value })
    }
    bindRepository = (domain) => {
        let obj = { name: domain.domainName, children: domain.pages, domain }
        this.setState({
            pageName: obj.name
        })
    }
    componentWillReceiveProps(nextProps) {

        if (!_.isEmpty(nextProps.currentDomain) && nextProps.currentDomain) {

            let currentDomain = nextProps.currentDomain
            if (currentDomain.type === "edit") {
                this.setState({ URL: currentDomain.domainURL, domainIndex: currentDomain.index, domainName: currentDomain.domainName, openPopup: true, openEditPopup: true })
                // this.props.revertTrainingReducer()
            } else {
                this.bindRepository(currentDomain)
                this.setState({ projectName: currentDomain.domainName, startUrl: currentDomain.domainURL })
                // this.props.revertTrainingReducer()
            }
        }

        if (!_.isEmpty(nextProps.removedDomain) && nextProps.removedDomain) {
            let removedDomain = nextProps.removedDomain
            let { projectName, startUrl } = this.state
            if (projectName === removedDomain.domainName && startUrl === removedDomain.domainURL) {
                this.setState({ projectName: "", pageName: "", startUrl: "", treeData: {}, myTreeData: [] })
            }
            // this.props.revertTrainingReducer()
        }
        this.setState({
            domainList: nextProps.domainList,
        })


    }

    getElementDetails = (e) => {
        console.log(e.target)
    }

    // createProject=(array)=>{
    //   console.log("create project ",array)
    //   // this.setState({URL:array[array.length-1].domainURL})
    //   this.extractSitemap(array[0].domainURL)

    //    this.repository=array
    // }
    customFunc = (e) => {
        let startUrl = e.url ? e.url : e.name
        let pageName = e.name
        this.setState({ startUrl, pageName })

    }
    extractSitemap = (domain, domainList) => {
        var formData = new FormData();
        formData.append("domain", domain)
        this.setState({ myTreeData: [], showLoader: true })
        axios.post(baseUrl + '/get-sites', formData).then(res => {
            if (res.data.status === 200) {
                this.setState({ myTreeData: res.data.data, GoalTreeData: res.data.data, showLoader: false })
                // this.getSiteMaps(res.data.data)
            }

        }).catch(e => {
            this.setState({ showLoader: false })
            toast.error("Api Error Response From /get_sites", {
                position: toast.POSITION.TOP_RIGHT
            });
        })
    }
    getSiteMaps = (domain, domainList) => {
        var formData = new FormData();
        formData.append("domain", domain)
        //   get_sites.getSiteMaps(formData).then(response=>{
        //     response=response.payload.data
        //     if(response.status===200){
        //       domainList[0].extractedPage=[response.data]
        //        this.setState({myTreeData:response.data.children,treeData:response.data,pageName:response.data.name,domainList},()=>{
        //        })
        //       //  let domainList=this.state.domainList
        //       //  let findIndex=_.findIndex(domainList,{domainURL:response.data.name})
        //       //  if(findIndex>=0){
        //       //   console.log(domainList[findIndex]&&response.data.children)
        //       //   domainList[findIndex].pages=response.data.children
        //       //   this.bindRepository(domainList[findIndex])
        //       //   this.setState({domainList})
        //       //  }

        //     }else{
        //       toast.error(response.message , {
        //         position: toast.POSITION.TOP_RIGHT
        //     }); 
        //     }

        //    }).catch(e=>{
        //     toast.error("Api Error Response From /get_sites", {
        //       position: toast.POSITION.TOP_RIGHT
        //   }); 
        //    })

        // 192.168.1.245:5000/get_sites
    }

    toggleRightMenu = () => {
        this.setState({
            showRightMenu: !this.state.showRightMenu
        });
        // this.props.toggleRightMenu(this.state.showRightMenu);
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
                                <input type="text" className="form-control" placeholder="Enter Domain Name" name="domainName"
                                    onChange={e => this.handleChange(e)} value={this.state.domainName} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputDomainURL">Domain / URL</label>
                                <input type="text" className="form-control" placeholder="Enter Domain URL"
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

    getSelectorPopup = () => {
        return (
            <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                <section className="card">
                    <header className="card-header">
                        <h2 className="card-title "> {this.state.pageName} Selector</h2>
                    </header>
                    <div className="card-body">
                        <form className="col-12">
                            <div className="form-row">
                                <label className="text-dark col-sm-2 col-form-label h5" >Major Seletor</label>
                                <input type="text" className="form-control col-sm-8" placeholder="Main Seletor"
                                    name="mainSelector" onChange={e => this.handleChange(e)} value={this.state.mainSelector} />
                            </div>
                        </form>
                        <br></br>
                        <form className="col-12">
                            <div className="form-row">
                                <label className="text-dark col-sm-2 col-form-label h5" >minor Goal</label>
                                <input type="text" className="form-control col-sm-8" placeholder="minor Goal"
                                    name="minorGoal" onChange={e => this.handleChange(e)} value={this.state.minorGoal} />
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
    handleChanges = (event) => {

        console.log(event.target.files)
        let self = this
        let array = event.target.files
        console.log(array[0])
        if (array.length > 0) {
            var reader = new FileReader();
            reader.onload = function () {
                self.setState({
                    file: array[0],
                    pdfDataForm: array[0],
                    pdfBlob: reader.result
                })
            }

            if (reader) {
                reader.readAsDataURL(event.target.files[0]);
            }

        }

    }
    createGoal = () => {
        let { goalDomainName, goalDomainIndex, domainList } = { ...this.state }
        console.log(goalDomainName, domainList[goalDomainIndex])
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
            // if(domainUrls.length>0){
            console.log(goalList)
            if (!_.find(goalList, { goalName: this.state.goalName })) {
                let tempObj = {
                    goalName: this.state.goalName,
                    goalDomains: domainList[goalDomainIndex],
                    // goalDataField:this.state.pdfBlob,
                    // goalDataBlob:this.state.file,
                    // domainUrls:domainUrls,
                    // minerSelector:{selectorName:this.state.selectorName,cssSelector:this.state.cssSelector},
                    expand: true
                }

                goalList.unshift(tempObj)
                this.setState({
                    currentGoalIndex: 0, goalList, modeUrl: "", mode_name: "", cssSelector: "",
                    goalName: "", goalDomainName: "", goalDomainIndex: "", pageList: [],
                    showPopup: false, domainUrls: [], pdfBlob: "", openPopup: false, createDomainPopup: false
                })

            } else {
                toast.error("Goal name already exist", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }


        }

        // console.log(goalList,temcurrentGoalIndexpObj,_.find(goalList,tempObj))
        // if(!_.find(goalList,tempObj)){
        // console.log(goalList)

        // }else{
        //   toast.error( "Model already exist with this URL", {
        //     position: toast.POSITION.TOP_RIGHT
        // });   
        // }
    }

    savePage = () => {

        let { goalList, currentGoalIndex, mainSelector, minorGoal, startUrl, pageName, iErrorSelector, iSuccessSelector } = { ...this.state }
        console.log(goalList[currentGoalIndex], goalList)

        let tempPage = { startUrl: startUrl, pageName: pageName, minorGoal: minorGoal, mainSelector: mainSelector, iSuccessSelector, iErrorSelector }
        //   goalList[goalIndex].expand=true
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

        console.log(goalList[currentGoalIndex].selectedPages)

        //   toast.success("Main  Selector updated in "+ goalList[ goalIndex].pages[findIndex].pageName + "page", {
        //         position: toast.POSITION.TOP_RIGHT
        //     }); 
        //  }else{

        //   goalList[goalIndex].pages.push(tempPage)
        //   this.setState({goalList})  
        //   toast.success("New page and Main  Selector added ", {
        //     position: toast.POSITION.TOP_RIGHT
        // }); 

        //  }
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
            console.log(type, index, pageIndex, domainList)

            this.setState({ domainList, goalExpand: false })

        }

    }

    startTraining = (goal, type) => {

        console.log(goal)
        let { pdfDataForm, errorType, iErrorSelector, iSuccessSelector } = { ...this.state }
        console.log(pdfDataForm)
        if (goal && goal.selectedPages && goal.selectedPages.length > 0) {
            var formData = new FormData();
            formData.append("goal_name", goal.goalName)
            formData.append("errorType", errorType)
            formData.append("errorSelector", iErrorSelector)
            formData.append("successSelector", iSuccessSelector)

            formData.append("pageDetail", JSON.stringify(goal.selectedPages))
            formData.append("start_url", goal.selectedPages[0].startUrl)
            formData.append("next", "next")
            formData.append("main_selector", goal.selectedPages[0].mainSelector)
            formData.append("input_data", pdfDataForm)
            formData.append("mode", type)
            console.log(formData)
        }
        //   Ml_action.startTraining(formData).then(response=>{
        //   console.log(response)
        //   if(parseInt(response.data.status)===200){

        //     toast.success( response.data.message, {
        //         position: toast.POSITION.TOP_RIGHT
        //     });
        //     let goalIndex=_.findIndex(this.state.goalList,{goalName:goal.goalName}) 
        //     console.log(goalIndex)
        //     if(goalIndex>=0){

        //        goalList[goalIndex].showStatusButton=true
        //       goalList[goalIndex].pdfBlob=pdfBlob 
        //       goalList[goalIndex].pdfDataForm=pdfDataForm 
        //       goalList[goalIndex].errorType= errorType 
        //       goalList[goalIndex].iErrorSelector= iErrorSelector 
        //       goalList[goalIndex].iSuccessSelector= iSuccessSelector 

        //       console.log(goalList)
        //       this.setState({goalList,trainingStated:true,trainGoalPopup:false})
        //       this.trainingIntervel(goalList,goalIndex)

        //     }
        //   }else{
        //     toast.success( "something went wrong in API code :"+response.data.status, {
        //         position: toast.POSITION.TOP_RIGHT
        //     }); 
        //   }

        //   }).catch(e=>{
        //     console.log(e)
        //     toast.error( "Error in /train_data API ", {
        //         position: toast.POSITION.TOP_RIGHT
        //     }); 
        //   })

        //   }else{
        //     toast.error( "Please save page to train ", {
        //       position: toast.POSITION.TOP_RIGHT
        //   }); 
        //   }

    }
    trainingIntervel = (goalList, goalIndex) => {

        // let self = this
        // let gts = setInterval(() => {
        // let color = 'yellow'
        // Ml_action.getTrainingStatus().then(response=>{
        //     if(response.payload.status===200){
        //       let data=response.payload.data
        //      let logs=data.data.log.split("\n")
        //        if(parseInt(data.status)!=200){
        //        if(parseInt(data.status)===201){
        //          toast.success("Training has been completed",{
        //           position: toast.POSITION.TOP_RIGHT
        //          }); 
        //         goalList[goalIndex].showInferenceBtn=true
        //         var trainingStatus = document.getElementById('trainingStatus');
        //          trainingStatus.scrollBy(0, trainingStatus.scrollHeight)
        //         this.setState({goalList})
        //        }else if(parseInt(data.status)===202){
        //         toast.error("Training has been"+data.data.training_status,{
        //         position: toast.POSITION.TOP_RIGHT
        //        }); 
        //        } 
        //          clearInterval(gts)
        //        }
        //      self.setState({logs,training_status:data.data.training_status,status:parseInt(data.status)})
        //   } 
        // })

        // }, 1000);
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
    pageAction = (type) => {
        let domainList = this.state.domainList
        if (type === "update") {
            domainList[this.state.domainIndex].pages[this.state.pageIndex].pageName = this.state.tempPageName
            domainList[this.state.domainIndex].pages[this.state.pageIndex].startUrl = this.state.tempPageUrl
            domainList[this.state.domainIndex].pages[this.state.pageIndex].mainSelector = this.state.tempMainSelector
            domainList[this.state.domainIndex].pages[this.state.pageIndex].minorGoal = this.state.tempMinorGoal

            this.setState({ pageName: this.state.tempPageName, startUrl: this.state.tempPageUrl, minorGoal: this.state.tempMinorGoal, mainSelector: this.state.tempMainSelector })
        } else if (type === "delete") {
            domainList[this.state.domainIndex].pages.splice(this.state.pageIndex, 1)
        }
        this.setState({ domainList, openPage: false })
    }
    frameClick = () => {
        console.log("**********8888")
    }
    loadDomain = (domainObj, index) => {
        console.log(domainObj, index)
        let pageIndex = _.findIndex(domainObj.pages, { startUrl: domainObj.domainURL })
        console.log(pageIndex, domainObj.pages[pageIndex])
        let mainSelector = ""
        let minorGoal = ""
        if (pageIndex >= 0 && domainObj.pages[pageIndex]) {
            mainSelector = domainObj.pages[pageIndex].mainSelector
            minorGoal = domainObj.pages[pageIndex].minorGoal
        }
        this.setState({ mainSelector: mainSelector, minorGoal: minorGoal, startUrl: domainObj.domainURL, projectName: domainObj.domainName, URL: domainObj.domainURL, domainIndex: index })
        // this.extractSitemap(domainObj.domainURL)
    }

    onToggleGoalPage = (node, toggled) => {
        const { cursor, GoalTreeData, goalList, currentGoalIndex } = this.state;
        if (cursor) {
            this.setState(() => ({ cursor, active: false }));
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }

        let goalObj = goalList[currentGoalIndex]
        console.log(goalObj)
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
        this.setState({
            iSuccessSelector, iErrorSelector,
            mainSelector, minorGoal,
            goalExpand: true,
            URL: node.url,
            startUrl: node.url, pageName: node.name
        },

            () => ({ cursor: node, GoalTreeData: Object.assign({}, GoalTreeData) }));
    }

    deletePage = (page, goalIndex, pageIndex) => {
        const { goalList } = this.state;
        goalList[goalIndex].selectedPages.splice(pageIndex, 1)
        this.setState({ goalList })
        console.log(goalList[goalIndex], page, goalIndex, pageIndex)

    }
    deleteGaol = (goal, index) => {
        let { goalList } = { ...this.state }
        if (window.confirm("Are you sure do you want delete it ?")) {
            goalList.splice(index, 1)
            this.setState({ goalList })
        }

    }
    deleteDomain = (obj, index) => {
        let { domainList,
            // startUrl, URL, pageName, findIndex 
        } = { ...this.state }
        if (window.confirm("Are you sure do you want delete it ?")) {
            domainList.splice(index, 1)
            // console.log(obj,domainList,URL,startUrl,pageName)
            //   if(URL===obj.domainURL){
            //     console.log(findIndex,domainList[domainList])
            //     this.setState({URL:"",domainName:"",domainList,openPopup:false,goalDomainIndex:"",openEditPopup:false,
            //     projectName:"",startUrl:"",domainIndex:0,mainSelector:"",minorGoal:"",iErrorSelector:"",iSuccessSelector:""})

            //   }
            this.setState({ domainList })
        }

    }
    render() {
        const { goalExpand } = { ...this.state }
        return (
            <div className="container-fluid">
                <Helmet>
                    <title>Project</title>
                </Helmet>
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
                                        <input type="text" className="form-control" placeholder=" Enter Goal Name"
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
                                {/* {this.state.pageList.length>0?
                   
          <div className="form-group">

              <form>
                  <div className="form-group">
                  <label className="inputProjectName" >Select page</label>
                    <Multiselect
                     options={ pageList} 
                    onSelectOptions={e=>this.result( pageList)} />
                  </div>    
              </form>
                <form>
              <label className="inputProjectName" >Choose Data File</label>
                <div className="form-group">
                  <div className="custom-file">
                        <input type="file" className="custom-file-input" id="customFile " 
                        name="pdfDataForm"  onChange={e=>this.handleChanges(e)}/>
                        <label className="custom-file-label" for="customFile">{this.state.file.name?this.state.file.name:"Choose file"}</label>
                    </div>
              </div>    

              </form>
         </div> :null  }
                     {this.state.pdfBlob!=""?
                      <iframe className="col-12 mt-2" src={this.state.pdfBlob}   alt={this.state.pdfBlob} />
                      :null} */}

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
                <Popup className="custom-modal"
                    open={this.state.trainGoalPopup}
                    closeOnDocumentClick={false}
                    onClose={e => this.setState({ trainGoalPopup: false })}
                >
                    <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                        <section className="card">
                            <header className="card-header">
                                <h2 className="card-title ">Train Goal </h2>
                                <b className="close text-right text" onClick={e => { this.setState({ trainGoalPopup: false }) }}>
                                    &times;
                          </b>
                            </header>
                            <div className="card-body">
                                {/* <form>
      <div class="form-row mb-3">
      <div class="col-md-3">
        
        <label for="inputProjectName">Error Type</label>
        </div>
          <div className="form-group col-md-8">
          <select name="errorType"  value={this.state.errorType} onChange={e=>this.handleChange(e)} className="form-control" >
              <option value=""  disabled hidden>Choose here</option>
              <option value="common" >Common</option>
              <option value="individual" >Individual</option>
          </select> 
          </div>
          </div>
        </form> */}
                                {/* {errorType=="common"? 
       <form>
         <div class="form-row mb-3">
      <div class="col-md-3">
        <label for="inputProjectName">Success selector</label>
        </div>
          <div className="form-group  col-md-8">
           <input type="text" className="form-control " id="successSelctor " 
           name="successSelctor"  onChange={e=>this.handleChange(e)}/>        
          </div>
        </div>
        <div class="form-row mb-3">
      <div class="col-md-3">
          <label for="inputProjectName">Error selector</label>
          </div>
          <div className="form-group  col-md-8">
          <input type="text"className="form-control " id="errorSelector " 
            name="errorSelector"  onChange={e=>this.handleChange(e)}/>
          </div>
          </div>
        </form>:null} */}

                                <div className="form-group">
                                    <form>
                                        <div class="form-row mb-3">
                                            <div class="col-md-3">
                                                <label className="inputProjectName" >Choose Data File</label>
                                            </div>
                                            <div className="form-group col-md-8">
                                                <div className="custom-file">
                                                    <input type="file" className="custom-file-input" id="customFile "
                                                        name="pdfDataForm" onChange={e => this.handleChanges(e)} />
                                                    <label className="custom-file-label" htmlFor="customFile">{this.state.file.name ? this.state.file.name : "Choose file"}</label>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                {this.state.pdfBlob !== "" ?
                                    <iframe className="col-12 mt-2" src={this.state.pdfBlob} title="pdfBlob" alt={this.state.pdfBlob} />
                                    : null}

                            </div>
                            <footer className="card-footer">
                                <div className="row">
                                    <div className="col-md-12 text-right">
                                        <button className="btn btn-primary modal-confirm mr-4" onClick={e => { this.startTraining(this.state.currentGoal, 't') }}>Train</button>
                                        <button className="btn btn-default modal-dismiss" onClick={e => { this.setState({ trainGoalPopup: false, createDomainPopup: false, getSelector: false }) }}>Cancel</button>
                                    </div>
                                </div>
                            </footer>
                        </section>
                    </div>
                </Popup>
                <Popup className="custom-modal"
                    open={this.state.showFile}
                    closeOnDocumentClick={false}
                    onClose={e => this.setState({ showFile: false })}
                >
                    <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                        <section className="card">
                            <header className="card-header">
                                <h2 className="card-title ">Goal File </h2>
                                <b className="close text-right text" onClick={e => { this.setState({ showFile: false }) }}>
                                    &times;
                          </b>
                            </header>
                            <div className="card-body">

                                {this.state.pdfBlob !== "" ?
                                    <iframe className="col-12 mt-2" src={this.state.pdfBlob} title="pdfBlob2" alt={this.state.pdfBlob} />
                                    : null}

                            </div>

                        </section>
                    </div>
                </Popup>
                <Popup className="custom-modal"
                    open={this.state.showTrainingStatus}
                    onClose={e => this.setState({ showTrainingStatus: false })}
                >
                    <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                        <section className="card">
                            <header className="card-header">
                                <h2 className="card-title ">Training Status</h2>
                                <b className="close text-right text" onClick={e => { this.setState({ showTrainingStatus: false }) }}>
                                    &times;
                          </b>
                            </header>
                            <div className="card-body" id="trainingStatus">

                                {this.state.logs.map((goal, index) =>
                                    <span >{goal}<br /></span>
                                )}
                            </div>
                            <footer className="card-footer">
                                <div className="row">
                                    <h3 className="card-title ">Status: </h3> <b className={this.state.status === 200 ? "text-warning" : this.state.status === 201 ? "text-success" : "text-danger"}>{this.state.training_status}</b>
                                    {/* <div className="col-md-12 text-right">
                        <button className="btn btn-primary modal-confirm mr-4"  onClick={e=>{this.loadUrl()}}>{this.state.openEditPopup===true?"Update":"Create"}</button>
                        <button className="btn btn-default modal-dismiss" onClick={e=>{this.setState({openPopup:false,domainName:this.state.projectName})}}>Cancel</button>
                      </div> */}
                                </div>
                            </footer>
                        </section>
                    </div>
                </Popup>
                <Popup className="custom-modal"
                    open={this.state.openPage}
                    closeOnDocumentClick={false}
                    onClose={e => this.setState({ openPage: false })}
                >
                    <div id="modalForm" className="modal-block modal-block-primary mfp-hide">
                        <section className="card">
                            <header className="card-header">
                                <h2 className="card-title ">Page Details</h2>

                                <b className="close text-right text" onClick={e => { this.setState({ openPage: false }) }}>
                                    &times;
                          </b>
                            </header>
                            <div className="card-body">

                                <form className="col-12">
                                    <div className="form-row">
                                        <label className="text-dark col-sm-2 col-form-label h5" > Page Name</label>
                                        <input type="text" className="form-control col-sm-8" placeholder="Enter Domain Name"
                                            name="tempPageName" onChange={e => this.handleChange(e)} value={this.state.tempPageName} />
                                    </div>
                                </form><br></br>
                                <form className="col-12">
                                    <div className="form-row">
                                        <label className="text-dark col-sm-2 col-form-label h5" >Page URL</label>
                                        <input type="text" className="form-control col-sm-8" placeholder="Enter Domain URL"
                                            name="tempPageUrl" onChange={e => this.handleChange(e)} value={this.state.tempPageUrl} />
                                    </div>
                                </form>
                                <br></br>
                                <form className="col-12">
                                    <div className="form-row">
                                        <label className="text-dark col-sm-2 col-form-label h5" >Major Seletor</label>
                                        <input type="text" className="form-control col-sm-8" placeholder="Major Seletor"
                                            name="tempMainSelector" onChange={e => this.handleChange(e)} value={this.state.tempMainSelector} />
                                    </div>
                                </form>
                                <br></br>
                                <form className="col-12">
                                    <div className="form-row">
                                        <label className="text-dark col-sm-2 col-form-label h5" >Minor Goal</label>
                                        <input type="text" className="form-control col-sm-8" placeholder="minor Goal"
                                            name="tempMinorGoal" onChange={e => this.handleChange(e)} value={this.state.tempMinorGoal} />
                                    </div>
                                </form>
                            </div>
                            <footer className="card-footer">
                                <div className="row">
                                    <div className="col-md-12 text-right">
                                        <button className="btn btn-success mr-3" onClick={e => { this.pageAction("update") }}>Update Page</button>
                                        <button className="btn btn-danger mr-3" onClick={e => { this.pageAction("delete") }}>Delete Page</button>
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
                                        {/* <div className="inner-menu-toggle-inside">
                                            <a className="inner-menu-collapse"
                                            // onClick={() => { this.props.showBar() }}
                                            >
                                                <i className="fas fa-chevron-up d-inline" aria-hidden="true"></i><i className="fas fa-chevron-left d-inline" aria-hidden="true"></i> Hide Bar
                        </a>
                                            <a className="inner-menu-expand" data-open="inner-menu"
                                            // onClick={() => { this.props.showBar() }}
                                            >
                                                Show Bar <i className="fas fa-chevron-down" aria-hidden="true"></i>
                                            </a>
                                        </div> */}
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
                                                        <span className="text-truncate w-207 d-block"
                                                            onClick={e => this.loadDomain(object, index)}>{object.domainName}</span>
                                                        <button className="btn btn-danger btn-xs d-inline ml-1 mr-1 " onClick={() => { this.deleteDomain(object, index) }}>  <i className="fas fa-trash-alt text-default "></i></button>


                                                    </label>
                                                </li>
                                                {object.expand ?
                                                    <Treebeard
                                                        key={index}
                                                        id={index}
                                                        onClick={e => { this.setState({ domainIndex: index }) }}
                                                        data={this.state.myTreeData}
                                                        onToggle={this.onToggle} />
                                                    : null}
                                                {/* {object.expand?
                                                  object.pages.map((page,pageIndex)=> 
                                                  page.startUrl?<li key={pageIndex}>
                                                <ul className="sublist">
                                                  <li  className="list-none position-relative"data-toggle="tooltip" title= {page.startUrl}
                                                  >

                                                     
                                                          <label className="c-pointer ml-1 align-label pl-1"
                                                          data-toggle="tooltip" title= {`Main  Selector: ${page.mainSelector}`}
                                                           onClick={e=>{this.setState({selectedPage:page,startUrl:page.startUrl,mainSelector:page.mainSelector,pageName:page.pageName})}} >
                                                           <span className="text-truncate w-207 d-block" >{page.pageName}</span>
                                                           <i className=" ml-2 fas fa-pencil-alt text-success fa-sm text-info align-pencil position-absolute"
                                                            onClick={e=>this.setState({domainIndex:index,projectName:object.domainName,pageIndex,selectedPage:page,tempPageName:page.pageName,tempPageUrl:page.startUrl,tempMainSelector:page.mainSelector,tempMinorGoal:page.minorGoal, openPage:true,})} ></i>
                                                            </label> 
                                                                  
                                                  </li>
                                              </ul>
                                              </li>:null
                                                  
                                           ):null}  */}

                                            </ul>
                                        )}
                                    </nav> : null}
                                    {/* <div className="text-white mt-n3">
                          <span>Project Repository</span>
                         

                              
                    </div> */}

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
                                                            <label className="c-pointer ml-1 align-label d-inline-flex" onClick={e => { this.setState({ goalIndex: index, openGoal: true }) }} > {goal.goalName}
                                                            </label>
                                                            <button className="btn btn-success btn-xs d-inline ml-1" onClick={() => { this.setState({ trainGoalPopup: true, currentGoal: goal }) }}> Train</button>
                                                            {goal.showStatusButton ?
                                                                <button data-toggle="tooltip" title="Run Inference" className="btn btn-warning btn-xs d-inline "
                                                                    onClick={() => { this.setState({ showTrainingStatus: true }) }}><i className={goal.showInferenceBtn ? "fas fa-cog" : "fas fa-cog fa-spin"}></i> </button>
                                                                : null}
                                                            {goal.showInferenceBtn ?
                                                                <button data-toggle="tooltip" title="Run Inference" className="btn btn-info btn-xs d-inline ml-1 " onClick={() => { this.startTraining(goal, 'i') }}><i className="far fa-eye"></i> </button>
                                                                : null}
                                                            {goal.pdfBlob ?
                                                                <button data-toggle="tooltip" title="Open File" className="btn btn-info btn-xs d-inline ml-1" onClick={() => { this.setState({ showFile: true, pdfFile: goal.pdfBlob }) }}><i className="fas fa-file-alt "></i> </button>
                                                                : null}

                                                            <button className="ml-1 btn btn-danger btn-xs d-inline mr-1 " onClick={() => { this.deleteGaol(goal, index) }}>  <i className="fas fa-trash-alt text-default "></i></button>


                                                        </li>
                                                        <span className="d-inline-flex">
                                                        </span>



                                                        {goal.expand === true ?
                                                            <div>

                                                                <span className="pt-1 pb-1 mt-1 text-center">
                                                                    {goal.selectedPages && goal.selectedPages.map((page, pageIndex) =>

                                                                        <form classname="position-relative tm-form c-pointer   w-100">
                                                                            <div class="btn-group mt-1 w-80" role="group" aria-label="Basic example">
                                                                                <button type="button" class="btn btn-default w-80" onClick={e => {
                                                                                    this.setState({
                                                                                        mainSelector: page.mainSelector,
                                                                                        minorGoal: page.minorGoal,
                                                                                        iErrorSelector: page.iErrorSelector,
                                                                                        iSuccessSelector: page.iSuccessSelector,
                                                                                        startUrl: page.startUrl, pageName: page.pageName
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
                                                                        data={this.state.GoalTreeData}
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

                                                                                {goalExpand ?
                                                                                    <div className="col-md-12">
                                                                                        <span className='col-md-12 h5'> Please Add Page Properties</span>
                                                                                        <div className="col-md-12">

                                                                                            <input type="text" className="form-control  col-md-2 d-inline  " placeholder="Main  Selector"
                                                                                                name="mainSelector" onChange={e => this.handleChange(e)} value={this.state.mainSelector} />
                                                                                            <input type="text" className="form-control col-md-2 d-inline  ml-1" placeholder="Minor Goal"
                                                                                                name="minorGoal" onChange={e => this.handleChange(e)} value={this.state.minorGoal} />
                                                                                            <input type="text" className="form-control  col-md-2 d-inline ml-1 " placeholder="Success Selector"
                                                                                                name="iSuccessSelector" onChange={e => this.handleChange(e)} value={this.state.iSuccessSelector} />
                                                                                            <input type="text" className="form-control  col-md-2 d-inline ml-1 " placeholder="Error  Selector"
                                                                                                name="iErrorSelector" onChange={e => this.handleChange(e)} value={this.state.iErrorSelector} />
                                                                                            <button className="btn btn-success col-md-2 ml-1" onClick={e => { this.savePage() }}>Save</button>

                                                                                        </div>
                                                                                    </div>
                                                                                    : null}

                                                                                <iframe className="col-12  mt-2 h-490px text-center" title="iframe loader" id="framLoader" style={{ height: "60vh" }}
                                                                                    type="text/html" src={this.state.startUrl}
                                                                                    onClick={e => { this.getElementDetails(e) }}
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

                                    }  </div>
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