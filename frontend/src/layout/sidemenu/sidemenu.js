 
    import React, { Component } from 'react';
    import 'react-toastify/dist/ReactToastify.css'; 
  import { withRouter } from "react-router"; 
  import { connect } from "react-redux";
  import _ from 'lodash'
   import { ToastContainer, toast } from 'react-toastify';
  import * as types from "../../actions/types"
  import Popup from "reactjs-popup";
  let HTML=""

   class Sidemenu extends Component {
      constructor(){
               super();
                  this.state = {
                    HTML:'',
                  showLoader:false,
                  URL:"",
                  element_selector:"",
                  URLarray:[],
                  cssSelector:"",
                  selectorName:"",
                  selectorIndex:0,
                  showPopup:false,
                  elementIndex:0,
                  goalList:[],
                  openRepo:false,
                  openModel:false,
                  modelUrl:"",
                  goalName:"",
                  modelIndex:0,
                  domainName:"",
                  domainList:[],
                  domainURL:"",
                  html: HTML,
                  domainIndex:0,
                  pageUrl:"",
                  pageName:"",
                  selectedPage:{}
              }
          }
          componentDidMount() {
         
          }
      
          handleChange = (event) => {
               console.log(event.target.name, event.target.value)
              this.setState({ [event.target.name]: event.target.value})
             
          }
       
          componentWillReceiveProps = (nextProps) => {
            //   console.log(nextProps.trainingReducer.goalList,"#############3",nextProps.trainingReducer.domainList)
              this.setState({domainList:nextProps.trainingReducer.domainList,goalList:nextProps.trainingReducer.goalList})
           
        }
        HistoryPush=(path)=>{
            this.props.history.push(path)
        }

        loadUrl=(value,domainName)=>{
            this.props.loadUrl( {url:value,domainName:domainName})
       let urls=this.state.URLarray
        urls.forEach(element => {
            if(element.url===value){
                element.expand=!element.expand
                
            }else{
                element.expand=false
            }
        });
        
        this.setState({URLarray:urls,openPopup:false})
         
        }

 
        selectCss=(element,index,elementIndex)=>{
            this.setState({selectorIndex:index,elementIndex,showPopup:true,openRepo:true,openModel:false, cssSelector:element.css,selectorName:element.name})
        }


        updateSelector=()=>{
            let urls=this.state.URLarray
            let tempObj={css:this.state.cssSelector,name:this.state.selectorName}
  
              if( urls[this.state.selectorIndex].element[this.state.elementIndex]){
                urls[this.state.selectorIndex].element[this.state.elementIndex]=tempObj
                this.setState({URLarray:urls,selectorName:"",cssSelector:"",showPopup:false})
                toast.success( "Css selector updates", {
                    position: toast.POSITION.TOP_RIGHT
                });    
              }else{
                  this.setState({showPopup:false})
              }
        }
        updateModel=()=>{
            let goalList=this.state.goalList
            let tempObj={goalName:this.state.goalName,URL:this.state.modelUrl}
 
              if( goalList[this.state.modelIndex]){
                goalList[this.state.modelIndex]=tempObj
                this.setState({goalList,showPopup:false,goalName:"",modelUrl:""})
                toast.success( "Model updated successfully", {
                    position: toast.POSITION.TOP_RIGHT
                });    
              }else{
                  this.setState({showPopup:false,showPopup:false,})
              }
        }
        deleteModel=()=>{
            let goalList=this.state.goalList
                _.remove(goalList,goalList[this.state.modelIndex])
                toast.success( "Model Deleted successfully", {
                    position: toast.POSITION.TOP_RIGHT
                });    
              this.setState({goalList,showPopup:false})
        }
        deleteSelector=(index)=>{
            let selectedPage=this.state.selectedPage
            selectedPage.selector.splice(index,1)
                this.setState({selectedPage})

            }
        
        selectGoal=(model)=>{
            console.log(model)
            let goalList=this.state.goalList
            let findIndex=_.findIndex(goalList,model)

            goalList.forEach((element,index) => {
                // console.log(findIndex,index)

                 if(findIndex===index){
                    goalList[index].expand=!goalList[index].expand
                 }else{
                    goalList[index].expand=false
                 }
                 
            });
            this.setState({goalList})

        }
        saveDomain=()=>{
            let domainList=[...this.state.domainList]
            console.log(domainList, this.state.domainName,_.find(domainList,{domainName:this.state.domainName}))
            if(!_.find(domainList,{domainName:this.state.domainName})){
                // console.log("#$$$$$$",domainList)
                domainList.unshift({domainName:this.state.domainName,domainURL:this.state.domainURL,
                    pages:[{selector:[]}]})
                this.setState({domainList,openPopup:false,domainName:"",domainURL:"",pageName:""})

            }else{ 
                 toast.error( "Domain name Already exist", {
                position: toast.POSITION.TOP_RIGHT
            });
        }

        }
        createDomin=()=>{

       this.setState({openPopup:true  })
      
    }


addPage=(type)=>{
    let domainList=[...this.state.domainList]
    
     let tempPage={pageUrl:this.state.pageUrl,pageName:this.state.pageName}
     let openPopup=false
    if(type==="delete"){
        if(window.confirm("Are you sure you want to delete domain?")){
            domainList.splice(this.state.domainIndex,1)

        }
    }else if(type==="add"){
        if(!_.find(domainList[this.state.domainIndex].pages,tempPage),this.state.pageName!=""&&this.state.pageUrl!=""){
            // console.log(tempPage,"#$$$$$$",domainList)
            tempPage.selector=[]
            tempPage.expand=true
            domainList[this.state.domainIndex].pages.push(tempPage)
            this.props.loadUrl( {url:this.state.pageUrl,domainName:this.state.domainName})
        }else{
            openPopup=true
            this.Toast('error',"Please enter valid URL and Page Name")
        }
    }else if(type==="update"){
            domainList[this.state.domainIndex].domainName=this.state.domainName
            this.props.loadUrl( {domainName:this.state.domainName})
        
    }
this.props.updateUrlElement(domainList)
    this.setState({domainList,addPage:openPopup,pageName:"",pageUrl:""})

}
expand=(type,domainIndex,pageIndex)=>{
    let domainList=this.state.domainList
    domainList.forEach((element,index) => {
        if(domainIndex!==index){
            element.expand=false
        }
    });
if(type==="domain"){
domainList[domainIndex].expand=!domainList[domainIndex].expand

}else if(type==="page"){
    domainList[domainIndex].pages[pageIndex].expand=!domainList[domainIndex].pages[pageIndex].expand
}
console.log(type,domainIndex,pageIndex,domainList)

this.setState({domainList})

}

 
Toast=(type,message)=>{
    toast[type]( message, {
        position: toast.POSITION.TOP_RIGHT
    }); 
}
pageAction=(type)=>{
    let domainList=this.state.domainList
console.log(domainList)
    if(type==="update"){
        domainList[this.state.domainIndex].pages[this.state.pageIndex].pageName=this.state.pageName
        domainList[this.state.domainIndex].pages[this.state.pageIndex].pageUrl=this.state.pageUrl

    }else if(type==="delete"){
  
        domainList[this.state.domainIndex].pages.splice(this.state.pageIndex,1)
    }
    this.setState({domainList,openPage:false})

}
goalAction=(type)=>{
    let goalList=this.state.goalList

    if(type==="update"){
        goalList[this.state.goalIndex].pages[this.state.pageIndex].pageName=this.state.pageName
        goalList[this.state.goalIndex].pages[this.state.pageIndex].pageUrl=this.state.pageUrl

    }else if(type==="delete"){
        if(window.confirm("Are you sure you want to delete Goal?")){
            goalList.splice(this.state.domainIndex,1)

        }
    }
    this.setState({goalList,openGoal:false})

}

    render() {
             
         return (
            <div className="">
          <Popup open={this.state.addPage}
                onClose={e=>this.setState({addPage:false})}
               >
                    <div className="model-close">
                                <div className="h3 " >
                             <b className="text-left"> Add Page </b>
                                     <b   className="close text-right text" onClick={e=>{this.setState({addPage:false})}}>
                                    &times;
                                    </b>
                                <div className="container">
                        <div className="row">

                            <div className="col text-center">
                                {this.state.editMode?
                                    <span className="row"><input type="text" className="form-control text-center col-10" placeholder="Enter Domain Name"
                                        name="domainName"  onChange={e=>this.handleChange(e)} value={this.state.domainName}/>
                                        <i className="fas fa-save text-success form-control col-2"
                                        onClick={e=>{this.addPage("update");this.setState({editMode:false})}}></i>
                                    </span>
                                            :
                                <span className="text-center h4 " >{this.state.domainName } 
                                 <i className="fas fa-pencil-alt text-primary fa-xs ml-1"onClick={e=>{this.setState({editMode:true})}}></i> </span> 
                                    }
                            </div>
                                    
                        </div>
                    
                    </div>
            </div>
        
                    <form className="col-12">
                        <div className="form-row">
                        <label className="text-dark col-sm-2 col-form-label h5" > Page Name</label>
                            <input type="text" className="form-control col-sm-8" placeholder="Enter Domain Name"
                            name="pageName"  onChange={e=>this.handleChange(e)} value={this.state.pageName}/>
                        </div>
                    </form><br></br>
                    <form className="col-12">
                        <div className="form-row">
                        <label className="text-dark col-sm-2 col-form-label h5" >Page URL</label>
                            <input type="text" className="form-control col-sm-8" placeholder="Enter Domain URL"
                            name="pageUrl"  onChange={e=>this.handleChange(e)} value={this.state.pageUrl}/>
                        </div>
                    </form>
                
                <div className="form-data text-right">
                    <button className="btn btn-success mr-3" onClick={e=>{this.addPage("add")}}>Save</button>
                </div>
                  <div className="form-data text-center text-danger">
                     <span className="h6" onClick={e=>this.addPage("delete")}>Do you want to delete domain?</span> 
                 </div>
             </div>  
             
                </Popup>


            <Popup open={this.state.openGoal}
                onClose={e=>this.setState({openGoal:false})}
               >
                   {this.state.goalList[this.state.goalIndex]?
                    <div className="model-close">
                     <div className="h3" >
                     <b className="text-dark "> Goal Detail </b>
                         <b className="close" onClick={e=>{this.setState({openGoal:false})}}>
                         &times;
                         </b>
                     </div>
                     <div className="form-group">
                           <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Goal Name</b></label>
                           <div className="col-sm-9">
                             <input type="text" className="form-control" placeholder="Enter Goal Name" name="goalName" value={this.state.goalList[this.state.goalIndex].goalName} onChange={e=>this.handleChange(e)}/>
                             </div>
                         </div>
                     </div>

                       <div className="form-group">
                           <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Selected URL</b></label>
                           <div className="col-sm-9">
                           <ul className="list-group list-group-flush">
                           {this.state.goalList[this.state.goalIndex]&&this.state.goalList[this.state.goalIndex].domainUrls.length>0?
                            this.state.goalList[this.state.goalIndex].domainUrls.map((page,index)=>
                              <li className="list-group-item" key={index}>{page.pageUrl}</li>
                              ):null}
                            </ul>

                             </div>
                         </div>
                     </div>
                     <div className="form-group">
                           <div className="row  mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b>Minor Selector</b></label>
                           <div className="col-sm-9">
                             <input type="text" className="form-control" placeholder="Enter Goal Name" name="goalName" value={this.state.goalList[this.state.goalIndex].minorSelector.cssSelector} onChange={e=>this.handleChange(e)}/>
                             </div>
                         </div>
                     </div>

                     <div className="form-group">
                           <div className="row  mx-0">
                             <label className="text-dark col-sm-3 col-form-label" ><b> Input Data List</b></label>
                           <div className="col-sm-9">
                            {this.state.goalList[this.state.goalIndex]&&this.state.goalList[this.state.goalIndex].goalDataField!=""?
                                <iframe className="col-12 mt-2" src={this.state.goalList[this.state.goalIndex].goalDataField}   alt={this.state.goalList[this.state.goalIndex].goalDataField} />
                                :null}    
                             </div>
                         </div>
                     </div>
                   
                     <div className="form-data text-right">
                    <button className="btn btn-danger mr-3" onClick={e=>{this.goalAction("delete")}}>Delete</button>
                </div>
                     {/* <div className="form-group">
                            
                       <div className="col-sm-9">
                           <div className="row mx-0">
                           <label className="text-dark col-sm-3 col-form-label" ><b> Select URL</b></label>

                             {this.state.goalList[this.state.goalIndex]&&this.state.goalList[this.state.goalIndex].domainUrls.length>0?
                            this.state.goalList[this.state.goalIndex].domainUrls.map((page,index)=>
                              
                              <label className="custom-control-label">{page.pageUrl}</label>
                              
                              ):null}
                            
                              </div> */}

                     {/* </div> */}
                     {/* </div> */}

              </div>
                   :null}
                    
          
             
  
                </Popup>





    <Popup open={this.state.openPage} onClose={e=>this.setState({openPage:false})}>
                    <div className="model-close">
                                <div className="h3 " >
                             <b className="text-left">Page Details </b>
                                     <b   className="close text-right text" onClick={e=>{this.setState({openPage:false})}}>
                                    &times;
                                    </b>
                                <div className="container">
                    </div>
            </div>
        
            <form className="col-12">
                  <div className="form-row">
                  <label className="text-dark col-sm-2 col-form-label h5" > Page Name</label>
                    <input type="text" className="form-control col-sm-8" placeholder="Enter Domain Name"
                     name="pageName"  onChange={e=>this.handleChange(e)} value={this.state.pageName}/>
                </div>
            </form><br></br>
            <form className="col-12">
                  <div className="form-row">
                  <label className="text-dark col-sm-2 col-form-label h5" >Page URL</label>
                    <input type="text" className="form-control col-sm-8" placeholder="Enter Domain URL"
                     name="pageUrl"  onChange={e=>this.handleChange(e)} value={this.state.pageUrl}/>
                </div>
            </form>
           <br></br>
            <div className="container">
           
           
      
          {this.state.selectedPage.selector&&this.state.selectedPage.selector.length>0?
                    <div>
                        
                      <b className="b h5">Selector List</b> 
                            
                            <table className="table table-hover">
                   <thead>
                   <tr>
                       <th>Selector Name</th>
                       <th>Css Selector</th>
                       <th >Action</th>
                   </tr>
                           </thead>
                           <tbody>
                       {this.state.selectedPage.selector.map((selector,index)=>
                       <tr key={index}>
                           <td contenteditable={this.state.selectedPage.selector[index].canEdit}><span onChange={e=>{this.setState({[this.state.selectedPage.selector[index].selectorName]:e.target.value})}}>{selector.selectorName}</span></td>
                           <td contenteditable='true'name="cssselector" onChange={e=>{this.handleChange(e)}}>{selector.cssSelector}</td>
                           <td onClick={e=>{this.deleteSelector(index)}}>  <i className="fas fa-trash fa-sm text-danger"></i></td>

                         </tr>
                         )}
                       
                        </tbody>
                 </table>
                        </div>
                        :null}

                    </div>

 <div className="form-data text-right">
            <button className="btn btn-success mr-3" onClick={e=>{this.pageAction("update")}}>Update Page</button>
            <button className="btn btn-danger mr-3" onClick={e=>{this.pageAction("delete")}}>Delete Page</button>

         </div>
         {/* <div className="form-data text-center text-danger">
       <span className="h6" onClick={e=>this.addPage("delete")}>Do you want to delete domain?</span> 
         </div> */}
            </div>  
                </Popup>
                
                <aside className={'sidebar-left ' + (this.props.showMenu ? '' : 'own-sidemenu-main closed')} id="sidebar-left">

                <div className="sidebar-header">
 				        <div className="sidebar-toggle d-none d-md-block"  onClick={this.props.toggleMenu}>
				            <i className="fas fa-bars" aria-label="Toggle sidebar" onClick={this.props.toggleMenu}></i>
				        </div>
				    </div>


                    <div className="nano has-scrollbar">
				        <div className="nano-content" tabindex="0" style={{'right': '-17px'}}>
				            <nav id="menu" className="nav-main" role="navigation">
				                <ul className="nav nav-main">
				                    <li>
				                        <a >
				                            <i className="fas fa-home" aria-hidden="true"></i>
				                            <span>Home </span>
				                        </a>                        
				                    </li>
				
				                </ul>
				            </nav>
				        </div>
                    </div>
				       
				    {/* <div className="nano-pane" style="opacity: 1; visibility: visible; display: none;"><div className="nano-slider" style="height: 205px; transform: translate(0px, 0px);"></div></div></div> */}

                    {/* <nano className="nano has-scrollbar">
				        <nano className="nano-content" tabIndex="0"> */}
                              
                           {/* {this.state.domainList.length>0?  <nav id="menu" className="nav-main" role="navigation">
                                 <label className=" h4 b text-info " > DOMAIN REPOSITORY</label>
                                      {this.state.domainList.map((object,index)=> 
                                            <div  key={index} className="mt-1 text-white">
                                            
                                            <li className="h5 b  list-none" >
                                                <i className={"far "+(object.expand ? 'fa-minus-square' : 'fa-plus-square')}
                                                onClick={e=>{this.expand("domain",index,object)}} ></i>
                                                <label className="c-pointer ml-1 h3"  data-toggle="tooltip" title= {"Click here to add page"} 
                                                    onClick={e=>{this.setState({addPage:true,domainIndex:index,domainName:object.domainName})}}>
                                                    {object.domainName} 
                                                </label> 
                                            </li>  
                                                 {object.expand?
                                                    object.pages.map((page,pageIndex)=> 
                                                    <ul key={pageIndex}>
                                                        <li  className="list-none"data-toggle="tooltip" title= {page.pageUrl}
                                                        onClick={e=>{this.loadUrl(page.pageUrl,object.domainName)}}>

                                                            <i className={"far "+(page.expand ? 'fa-minus-square' : 'fa-plus-square')} 
                                                            onClick={e=>{this.expand("page",index,pageIndex)}} >
                                                             </i>
                                                                <label className="c-pointer ml-1 h4"
                                                                data-toggle="tooltip" title= {"URL: "+page.pageUrl}
                                                                 onClick={e=>{this.setState({selectedPage:page})}} >{page.pageName}  <i className=" ml-2 fas fa-pencil-alt text-success fa-sm text-info"
                                                                  onClick={e=>this.setState({domainIndex:index,pageIndex,selectedPage:page,pageName:page.pageName,pageUrl:page.pageUrl,openPage:true,})} ></i></label> 
                                                            
                                                                {page.expand? <ul>
                                                                    {page.selector.length>0?
                                                                    page.selector.map((selector,index)=>
                                                                        <li className="mr-1 h5 c-pointer" key={index} data-toggle="tooltip" title= {"CSS: "+selector.cssSelector}  >{selector.selectorName}</li>
                                                                        ):null}
                                                                        
                                                                </ul>:null}
                                                                        
                                                        </li>
                                                    </ul>
                                             ):null} 
                                    
                                    </div>
                                )}
                                                     
                            </nav>:null} */}
                        {/* {this.state.goalList.length>0?    
                            <nav id="menu" className="nav-main mt-5 " role="navigation">
                          <label className=" h4 b text-info " > GOAL REPOSITORY</label>
                            {this.state.goalList.map((goal,index)=> 
                                <div  key={index} className="mt-4 text-white">
                                   
                              <span className="h4 b  c-pointer row ml-1 " value={goal.goalName} 
                               >
                              <i className={"c-pointer far "+(goal.expand===true ? 'fa-minus-square' : 'fa-plus-square') } onClick={e=>{this.selectGoal(goal)}}></i>
                              <label className="ml-1" onClick={e=>{this.setState({goalIndex:index,openGoal:true})}} > {goal.goalName}</label> </span>
                                <ul>
                                      {goal.expand===true?
                                          goal.domainUrls.map((url,index)=>
                                          <li key={index} data-toggle="tooltip" title= {goal.pageUrl} className=" b c-pointer"
                                        //    onClick={e=>{this.setState({modelIndex:index,showPopup:true,
                                        //    openRepo:false,openModel:true,modelUrl:goal.pageUrl
                                        //    ,goalName:goal.goalName})}}
                                           >
                                          <span className="ml-1 h5 text-white">{url.pageName}</span>
                                       </li>
                                       )
                                    
                                        :null}
                                </ul>  

                                </div>
                            )}
                            </nav>:null} */}

				        {/* </nano>
				    </nano> */}

                </aside >
                <ToastContainer/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
     return {
        trainingReducer:state.trainingReducer,
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
     loadUrl:(obj)=>{dispatch({type:types.URL,payload:obj})},
            updateUrlElement:(URL)=>{dispatch({type:types.UPDATE_URL_ELEMENT,payload:URL})},

    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidemenu));

 