 
    import React, { Component } from 'react';
    import 'react-toastify/dist/ReactToastify.css'; 
  import { withRouter } from "react-router"; 
  import { connect } from "react-redux";
  import _ from 'lodash'
   import { ToastContainer, toast } from 'react-toastify';
  import * as types from "../../actions/types"
  import Popup from "reactjs-popup";
  let HTML=""

   class Rightsidemenu extends Component {
      constructor(){
               super();
                  this.state = {
                    domainList:[]
              }
          }
          componentWillReceiveProps(nextProps){
             this.setState({domainList:nextProps.trainingReducer.domainList,goalList:nextProps.trainingReducer.goalList,URL:nextProps.trainingReducer.URL,domainName:nextProps.trainingReducer.domainName})
            if(nextProps.trainingReducer.domainName!==this.state.domainName){
              let findDomainIndex= _.findIndex(this.state.domainList,{domainName:this.state.domainName})
              this.setState({domainIndex:findDomainIndex})
            }
          }
          removeDomain=(obj,i)=>{
            console.log(obj)
            let domainList=this.state.domainList
            domainList.splice(i,1)
            this.setState({domainList})
            this.props.removeDomain(obj)
          }
          viewDomain=(obj,i,type)=>{
              obj.type=type
              obj.index=i
            this.props.viewDomain(obj)
           }
    render() {
        console.log(this.state.domainList[0])
            return (
            <div className="" style={{backgroundColor:"red"}}>
  <aside className={' sidebar-left  right-side ' + (this.props.showRightMenu ===true? '' : 'own-sidemenu-main closed')} id="sidebar-left">

{/* 
    <div className="sidebar-header">
         <div className="sidebar-toggle d-none d-md-block"  onClick={this.props.toggleRightMenu}>
            <i className="fas fa-bars" aria-label="Toggle sidebar" onClick={this.props.toggleRightMenu}></i>
        </div>
    </div> 
*/}
 <h2 className="text-white ml-2 b fs17"> <b>Projects</b></h2>
    <nano className="nano has-scrollbar">
        <nano className={this.props.showRightMenu ===true? '' : 'nano-content'}  tabIndex="0">
        <a  className="mobile-close d-md-none" onClick={e=>{this.props.toggleRightMenu()}}>
            Collapse <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </a>
                { this.state.domainList.map((obj,i) => (
                        <div key={i} className="custom-panel mt-2 ml-2 mr-2">
                            <div className="panel-body">
                                <h2 className="link-txt b text-wrap"><b>{obj.domainName}</b></h2>
                                <b className="h5 break-word">{obj.domainURL}</b>

                            <div className="border-top mt-4 py-2 white-space-nowrap">
                                <button className="btn btn-success mr-1  btn-xs" onClick={e=>{this.viewDomain(obj,i,"view")}} ><i className="fas fa-eye"></i> View</button>
                                <button className="btn btn-info mr-1   btn-xs" onClick={e=>{this.viewDomain(obj,i,'edit')}}><i className="fas fa-edit"></i> Edit</button>
                                <button className="btn btn-danger mr-1  btn-xs"  onClick={e=>{this.removeDomain(obj,i)}}><i class="fas fa-trash"></i> Remove</button>
                            </div>
                            </div>
                        </div>
                    ))}
        </nano>
    </nano>

</aside >                <ToastContainer/>
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
     viewDomain:(domain)=>{dispatch({type:types.VIEW_DOMAIN,payload:domain})},
     removeDomain:(domain)=>{dispatch({type:types.REMOVE_DOMAIN,payload:domain})},

     }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Rightsidemenu));

 