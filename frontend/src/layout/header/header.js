import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import { connect } from "react-redux";
import _ from 'lodash'
import Popup from "reactjs-popup";
import { ToastContainer, toast } from 'react-toastify';
import * as types from "../../actions/types"
import  MultiSelectReact  from 'multi-select-react';
import MultiSelect from "@khanacademy/react-multi-select";
import Multiselect from 'multiselect-dropdown-react';
import logoImage from '../../assets/images/logo-web.png'
import userImage from '../../assets/images/user.jpg'
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap';

const options = [
  {label: "One", value: 1},
  {label: "Two", value: 2},
  {label: "Three", value: 3},
];
let image=""
let data = [];
let selectedUrl=[]
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseOne:false,
      taskPopoverOpen:false,
      nofityPopoverOpen:false,
      displayMenu:false,
      profile:this.props.profile,
      activeType:this.props.activeType,
      URL:"",
      element_selector:"",
      URLarray:[],
      showPopup:false,
      cssSelector:"",
      selectorName:"",
      createSelector:false,
      createGoal:false,
      mode_name:"",
      modeUrl:"",
      modelList:[],
      domainUrls:[   ],
      domainList:[],
      
      pageName:"",
      goalDomainName:"",
      goalDomainIndex:"",
      pdfBlob:"",
          selected: [],

     }
  }
  handleChange = (event) => {
    let name=event.target.name
             if(name==="goalDomainName"){
             
             
               let goalDomainIndex=_.findIndex(this.state.domainList,{domainName:event.target.value})
              // console.log(goalDomainIndex,event.target.value)
              // console.log(this.state.domainList[goalDomainIndex]
              // ,goalDomainIndex)
              data=[]
              if(this.state.domainList[goalDomainIndex]&&this.state.domainList[goalDomainIndex].pages.length>0){
                console.log(this.state.domainList[goalDomainIndex].pages)
                if(this.state.createGoal===true){
                 
                  this.state.domainList[goalDomainIndex].pages.forEach(element => {
                   data.push({name:element.pageName,value:element.pageName,element}) 
                  });
                }
                console.log(data)
              }
              this.setState({goalDomainIndex})
             }
    this.setState({ [event.target.name]: event.target.value })
   
}
handleChanges=(event)=>{
  console.log(event.target.files)
  let self=this
  let array=event.target.files
  if(array.length>0){
  
    var reader = new FileReader();
    reader.onload = function()
    {
    self.setState({
      pdfBlob: reader.result
    })
  }

if( reader){
reader.readAsDataURL(event.target.files[0]);
}

  }

}

  componentDidMount(){
    if(window.location.pathname==="/scan"){
      this.setState({showPatientDetailsButton:true})
    }
     }
  componentWillReceiveProps(nextProps){
    //  console.log(nextProps.trainingReducer)
    this.setState({domainList:nextProps.trainingReducer.domainList,goalList:nextProps.trainingReducer.goalList,URL:nextProps.trainingReducer.URL,domainName:nextProps.trainingReducer.domainName})
if(nextProps.trainingReducer.domainName!==this.state.domainName){
  let findDomainIndex= _.findIndex(this.state.domainList,{domainName:this.state.domainName})
  this.setState({domainIndex:findDomainIndex})
}
  }

//   logOut = () => {
//     // this.props.newSession()
//     localStorage.removeItem('intelliscope-token')
//     localStorage.removeItem('session_id')
//     this.props.history.push('/')
// }
HistoryPush=(path)=>{
  this.props.history.push(path)
  this.setState({ displayMenu: false})

}
goToChangePassword=()=>{
  // this.props.history.push('/change-password')
}



loadUrl=(value)=>{
  
  let domainList=[...this.state.domainList]
  // console.log(domainList, this.state.domainName,_.find(domainList,{domainName:this.state.domainName}))
  domainList.forEach(element => {
      element.expand=false
    });
  if(!_.find(domainList,{domainName:this.state.domainName})){
    domainList.unshift({domainName:this.state.domainName,domainURL:this.state.URL,expand:true,
                        pages:[{pageName:this.state.pageName,pageUrl:this.state.URL,expand:false,
                         selector:[]}]})
    // console.log("#$$$$$$",domainList)

    this.setState({domainList,openPopup:false,goalDomainIndex:""})

    this.props.loadUrl( {url:this.state.URL,domainName:this.state.domainName})
    this.props.updateUrlElement(domainList)

}else{
  toast.error( "Domain already exist ", {
    position: toast.POSITION.TOP_RIGHT
}); 
}

  // let urls=this.state.URLarray

  //       if(this.state.URL!==value&&value!==""){
  //           this.setState({URL:value})
  //           }
  //        if(! _.find(urls,{url:this.state.URL})&&value!==""){
  //            urls.unshift({url:this.state.URL,expand:false,element:[]})
  //           }
  //         urls.forEach(element => {
  //               if(element.url===value){
  //                   element.expand=!element.expand
  //               }else{
  //                   element.expand=false
  //               }
  //         });
  //   this.setState({URLarray:urls,openPopup:false})


}

saveSelector=()=>{
  
  let domainList=this.state.domainList
   let domainIndex= _.findIndex(domainList,{domainName:this.state.domainName})


  //  console.log(URLIndex,urls,_.find(urls[URLIndex].element,{css:this.state.cssSelector,name:this.state.selectorName}))

   if(domainIndex>=0){ 
    let URLIndex= _.findIndex(domainList[domainIndex].pages,{pageUrl:this.state.URL})
    // console.log(URLIndex,domainList[domainIndex].pages,)
    if(URLIndex>=0){
      let tempSelector={cssSelector:this.state.cssSelector,selectorName:this.state.selectorName}
      if(!_.find(domainList[domainIndex].pages[URLIndex].selector,tempSelector)&&this.state.cssSelector!==""
      &&this.state.selectorName!==""){
      
        domainList.forEach(element => {
                  element.expand=false
          });

          domainList[domainIndex].expand=true 
          domainList[domainIndex].pages[URLIndex].expand=true
          domainList[domainIndex].pages[URLIndex].selector.push(tempSelector)

          this.setState({domainList,selectorName:"",cssSelector:"",showPopup:false})
          // console.log(domainList)
          this.props.updateUrlElement(domainList)
          toast.success( "Parent Tag created", {
            position: toast.POSITION.TOP_RIGHT
        });     
  

      }else{
        toast.error( "This value already exist", {
                position: toast.POSITION.TOP_RIGHT
            });     
      }
    }
  
  }else{
     toast.info( "Pleasee create Domin", {
                position: toast.POSITION.TOP_RIGHT
            });     
      
  }

}
createGoal=()=>{
 
  let domainUrls=this.state.domainUrls
  selectedUrl.forEach(element => {
    domainUrls.push(element.element) 
  });
  this.setState({domainUrls})

  let modelList=this.state.modelList
  

  console.log(this.state.domainUrls)
    modelList.forEach(element => {
    element.expand=false
  });

  if(this.state.domainUrls.length>0){
 

    if(!_.find(modelList,{goalName:this.state.goalName})){
      let tempObj={goalName:this.state.goalName,
        goalDataField:this.state.pdfBlob,
        domainUrls:this.state.domainUrls,
        minorSelector:{selectorName:this.state.selectorName,cssSelector:this.state.cssSelector},
        expand:true}
      modelList.unshift(tempObj)
      this.setState({modelList,modeUrl:"",mode_name:"",selectorName:"",cssSelector:"",
      goalName:"",goalDomainName:"",goalDomainIndex:"", 
      showPopup:false,domainUrls:[]})
      this.props.createGoal(modelList)

    }else{
      toast.error("Goal name already exist", {
            position: toast.POSITION.TOP_RIGHT
        }); 
    }

  }else{
    toast.error("Please choose any page", {
          position: toast.POSITION.TOP_RIGHT
      }); 
  }
  // console.log(modelList,tempObj,_.find(modelList,tempObj))
  // if(!_.find(modelList,tempObj)){
    // console.log(modelList)

  // }else{
  //   toast.error( "Model already exist with this URL", {
  //     position: toast.POSITION.TOP_RIGHT
  // });   
  // }
}

addUrl=(obj)=>{
  
  console.log(obj)
  let domainUrls=this.state.domainUrls
  if(_.find(domainUrls,obj)){
    _.remove(domainUrls,obj)
    this.setState({domainUrls})
   }else{
    domainUrls.unshift(obj)
    // console.log("##############",domainUrls)
    this.setState({domainUrls})

  }

}
 optionClicked=(optionsList) =>{
        this.setState({ multiSelect: optionsList });
  }
  selectedBadgeClicked =(optionsList)=> {
        this.setState({ multiSelect: optionsList });
  }
  handleSelectChange=(selected)=>{
console.log(selected)
  }
  result=(params)=> {
    console.log(params);
    selectedUrl=params
  }
openCreateGoalPopup=()=>{
  this.setState({showPopup:true,createSelector:false,
    createGoal:true,selectorName:"Minor Goal", pdfBlob:""})
    data=[]
    if(this.state.domainList[this.state.goalDomainIndex]&&this.state.domainList[this.state.goalDomainIndex].pages.length>0){
      console.log(this.state.domainList[this.state.goalDomainIndex].pages)
      if(this.state.createGoal===true){
       
        this.state.domainList[this.state.goalDomainIndex].pages.forEach(element => {
         data.push({name:element.pageName,value:element.pageName,element}) 
        });
      }
      console.log(data)
    }
   
}
  render() {
   
     
     return (

      <div >
          <Popup open={this.state.openPopup}
                onClose={e=>this.setState({openPopup:false})}
               >
        <div className="model-close">
            <div className="h3" >
            <b> New Project </b>
                <b   className="close" onClick={e=>{this.setState({openPopup:false})}}>
                &times;
                </b>
            </div>
            <form className="col-12">
                  <div className="form-row">
                  <label className="text-dark col-sm-2 col-form-label h5" >Project Name</label>
                    <input type="text" className="form-control col-sm-8" placeholder="Enter Domain Name" name="domainName"  onChange={e=>this.handleChange(e)} value={this.state.domainName}/>
                </div>
            </form><br></br>
            <form className="col-12">
                  <div className="form-row">
                  <label className="text-dark col-sm-2 col-form-label h5" > Domain / URL</label>
                    <input type="text" className="form-control col-sm-8" placeholder="Enter Domain URL"
                     name="URL"  onChange={e=>this.handleChange(e)} value={this.state.URL}/>
                </div>
            </form><br></br>
            {/* <form className="col-12">
                  <div className="form-row">
                  <label className="text-dark col-sm-2 col-form-label h5" > Page Name</label>
                    <input type="text" className="form-control col-sm-8" placeholder="Enter Page Name"
                     name="pageName"  onChange={e=>this.handleChange(e)} value={this.state.pageName}/>
                </div>
            </form>  */}
            

       <div className="form-data text-right">
            <button type="submit" className="btn btn-success mr-3" onClick={e=>{this.loadUrl()}}>Save</button>
         </div>
            </div>  
                </Popup>

        {this.state.showPopup===true?

            <Popup open={this.state.showPopup}
                     onClose={e=>this.setState({showPopup:false})}
                    >
                   {this.state.createSelector===true? <div className="model-close">
                    <div className="h3" >
                    <b>Create Selector </b>
                        <b className="close" onClick={e=>{this.setState({showPopup:false})}}>
                        &times;
                        </b>
                    </div>
                    {/* <form className="col-12">
                          <div className="form-row">
                          <label className="text-dark col-sm-2 col-form-label h5" > {this.state.selectorName}</label> */}
                          {/* <select name="selectorName"  value={this.state.selectorName} onChange={e=>this.handleChange(e)} className="form-control" > */}
                                      {/* <option value=""  disabled hidden>Choose here</option> */}
                                        {/* {this.state.domainList.map((obj,index)=> */}
                                        {/* <option key={1} value={""Parent Tag"}>"Parent Tag</option>
                                        <option key={2} value={"Next Selector"}>Next selector</option> */}

                                      {/* )} */}
                                  {/* </select> */}
                            {/* <input type="text" className="form-control" placeholder="Enter Selector Name" name="selectorName" value={this.state.selectorName} onChange={e=>this.handleChange(e)}/>
                        </div> */}
                    {/* </form><br></br> */}
                    <div className="form-group">
                      <div className="row mx-0">
                      <label className="text-dark col-sm-2 col-form-label h5" >{this.state.selectorName}</label>
                            <div className="col-sm-9">
                            <input type="text" className="form-control" placeholder="Enter Css Selector" name="cssSelector" value={this.state.cssSelector} onChange={e=>this.handleChange(e)}/>
                              </div>
                           
                      </div>
                      </div>
                    {/* <form className="col-12">
                          <div className="form-row">
                          <label className="text-dark col-sm-2 col-form-label h5" >Css Selector</label>
                            <input type="text" className="form-control" placeholder="Enter Css Selector" name="cssSelector" value={this.state.cssSelector} onChange={e=>this.handleChange(e)}/>
                        </div>
                    </form> */}
                       <button type="submit" className="btn btn-info" onClick={e=>{this.saveSelector()}}>Save</button>
                    </div>:

                    this.state.createGoal===true?

                     <div className="model-close">
                     <div className="h3" >
                     <b className="text-dark "> Create Goal </b>
                         <b className="close" onClick={e=>{this.setState({showPopup:false})}}>
                         &times;
                         </b>
                     </div>
                     <div className="form-group">
                           <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Goal Name</b></label>
                           <div className="col-sm-9">
                             <input type="text" className="form-control" placeholder="Enter Goal Name" name="goalName" value={this.state.goalName} onChange={e=>this.handleChange(e)}/>
                             </div>
                         </div>
                     </div>
                     <div className="form-group">
                           <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Select Domain</b></label>
                             <div className="col-sm-9">
                                 <select name="goalDomainName"  value={this.state.goalDomainName} onChange={e=>this.handleChange(e)} className="form-control" >
                                      <option value=""  disabled hidden>Choose here</option>
                                        {this.state.domainList.map((obj,index)=>
                                        <option key={index} value={obj.domainName}>{obj.domainName}</option>
                                      )}
                                  </select>
                              </div>
                      </div>
                     </div>

             
                    {this.state.domainList[this.state.goalDomainIndex]&&this.state.domainList[this.state.goalDomainIndex].pages.length>0?
                     <div className="form-group">
                           <div className="row mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Select URL</b></label>

                              <div className="col-sm-9">
                             {this.state.domainList[this.state.goalDomainIndex]&&this.state.domainList[this.state.goalDomainIndex].pages.length>0?
                            // this.state.domainList[this.state.goalDomainIndex].pages.map((page,index)=>
                          
                              <div className="App">
                                      <Multiselect options={data} onSelectOptions={e=>this.result(data)} />
                                    </div>    
                             //   <p  key={index}className="custom-control custom-checkbox">
                            //   <input type="checkbox" className="custom-control-input" 
                            //    onChange={e=>this.addUrl(page)}
                            //    id={page.pageUrl} value={page.pageName} 
                            //    />
                            //   <label className="custom-control-label h5" htmlFor={page.pageUrl}>{page.pageName}</label>
                            // </p>
                              
                              :null}
                                {/* <MultiSelect
                            
                                      options={this.state.domainList[this.state.goalDomainIndex].pages}
                                      selected={domainUrls}
                                      onSelectedChanged={domainUrls => this.setState({domainUrls})}
                                    />  */}
                              </div>
                           
                      </div>
                      <div className="form-group">
                      <div className="row mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b>{this.state.selectorName}</b></label>
                              <div className="col-sm-9">
                            <input type="text" className="form-control" placeholder="Enter Goal Name" name="cssSelector" value={this.state.cssSelector} onChange={e=>this.handleChange(e)}/>
                              </div>
                           
                      </div>
                      </div>
                          <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Choose Data File</b></label>
                            <div className="col-sm-9">
                             <div className="custom-file">
                                <input type="file" className="custom-file-input" id="customFile " name="pdfDataForm" value={this.state.pdfDataForm} onChange={e=>this.handleChanges(e)}/>
                                <label className="custom-file-label" for="customFile">Choose file</label>
                              </div>
                              
                             {/* <input type="file" className="form-control" placeholder="Choose file data" name="pdfDataForm" value={this.state.pdfDataForm} onChange={e=>this.handleChanges(e)}/> */}
                             </div>
                                  
                      </div>

                     </div>

                    :null
                    }
                    
                     

                     {this.state.pdfBlob!=""?
                      <iframe className="col-12 mt-2" src={this.state.pdfBlob}   alt={this.state.pdfBlob} />
                      :null}

                        <button className="btn btn-info" onClick={e=>{this.createGoal()}}>Create</button>
                     </div>
                     :""}
                   
                   


            </Popup>

      :null}
        <header className="header header-nav-menu header-nav-stripe fixed-top">

                <div className="logo-container position-relative">

					<b  className="col-md-2.9 ml-4 logo">
           {/* <input type="button" value="Home" className="btn btn-primary"/> */}
               <img  className="text-info logo-size" src={logoImage}></img>
          </b>
          <span className="separator position-absolute"></span>

				<div className="header-right">
      
        {/* <ul className="list-inline d-inline-block">
          <li className="list-inline-item mr-3 c-pointer">
            <a className="btn-shadow" id="task" onClick={e=>{this.setState({displayMenu:false,taskPopoverOpen:!this.state.taskPopoverOpen,nofityPopoverOpen:false})}}>
            <i className="fas fa-tasks" ></i>
            <span className='badge'>0</span>
            </a>
            <Popover placement="bottom" isOpen={this.state.taskPopoverOpen} target="task" toggle={this.toggle}>
          <PopoverHeader  style={{'background-color':" #0088cc"}} className="text-white">TASKS NOTIFICATION </PopoverHeader>
          <PopoverBody>Empty</PopoverBody>
        </Popover>
     
          </li>
          <li className="list-inline-item c-pointer">
            <a className="btn-shadow" id="notification"  onClick={e=>{this.setState({displayMenu:false,nofityPopoverOpen:!this.state.nofityPopoverOpen,taskPopoverOpen:false})}} >
              <i className="fas fa-bell"></i>
              <span className='badge'> 0</span>
            </a>
            <Popover placement="bottom" isOpen={this.state.nofityPopoverOpen} target="notification" toggle={this.toggle}>
          <PopoverHeader style={{'background-color':" #0088cc"}} className="text-white">ALERTS CAN GO HERE</PopoverHeader>
          <PopoverBody> Empty</PopoverBody>
        </Popover>
          </li>
        </ul> */}

          <span className="separator"></span>
					<div id="userbox" className="userbox show">
                <a data-toggle="dropdown" className="c-pointer"   onClick={e=>this.setState({nofityPopoverOpen:false,taskPopoverOpen:false, displayMenu: !this.state.displayMenu })} >
                    <figure className="profile-picture"> <img src={userImage} alt="Joseph Doe" className="rounded-circle"/></figure>
                    <div className="profile-info">
                        <span className="name">{!_.isEmpty(this.state.profile)?this.state.profile.firstname+""+this.state.profile.lastname:"MARK OTTO"}</span>
                        <span className="role">{!_.isEmpty(this.state.profile)?this.state.profile.userType===3?"Admin":"Admin":"Admin"}</span>
                    </div>
                    <i className={(this.state.displayMenu?"fas fa-chevron-up":"fas fa-chevron-down")+" bg-white"} aria-hidden="true" 
                  ></i>
                </a>
                {this.state.displayMenu ? 
                  <div className="dropdown-menu show">
                      <ul className="list-unstyled mb-2">
                      <li className="divider"></li>
                          <li><a role="menuitem" tabIndex="-1" 
                          // onClick={()=>{this.HistoryPush('/profile')}}
                          ><i className="fas fa-user pr-2"></i> My Profile</a> </li>
                          <li><a role="menuitem" tabIndex="-1" 
                          // onClick={()=>{this.HistoryPush('/change-password')}}
                          ><i className="fas fa-lock pr-2"></i> Change Password</a> </li>
                           <li><a role="menuitem" tabIndex="-1"
                            // onClick={e=>this.logOut(e)}
                            ><i className="fas fa-power-off pr-2"></i> Logout</a></li>
                      </ul>
                      </div>
                   :
                  null
                }
               
            </div>
				</div>
        </div>

				 
			</header>
       <ToastContainer/>
      </div>

    )
  }
}
 
const mapStateToProps = (state) => {
  return {
     trainingReducer:state.trainingReducer

   }
}
const mapDispatchToProps = (dispatch) => {
return {
   loadUrl:(obj)=>{dispatch({type:types.URL,payload:obj})},
  updateUrlElement:(URL)=>{dispatch({type:types.UPDATE_URL_ELEMENT,payload:URL})},
  createGoal:(array)=>{dispatch({type:types.CREATE_GOAL,payload:array})},


}
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));

