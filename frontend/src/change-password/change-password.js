import React, { Component } from 'react';
import '../assets/css/theme.css'
import '../assets/css/skins/default.css'
 import * as authAction from "../actions/auth.action";
 import { ToastContainer, toast } from 'react-toastify';

export default class ChangePassword extends Component {
  
  constructor(props){
    super(props);      
this.state={
	old_password:'',
	confirm_password:'',
	new_password:''
}
  }
  handleChange=(e)=>{
this.setState({[e.targer.name]:e.target.value})
  }
  ChangePassword=(e)=>{
// console.log(this.state,this.props,this.context)
let obj={
	old_password:this.state.old_password,
	confirm_password:this.state.confirm_password,
	new_password:this.state.new_password
}
console.log(obj,JSON.parse(localStorage.getItem('user')).id)

 authAction.changePassword(JSON.parse(localStorage.getItem('user')).id,obj).then(res=>{
	console.log(res)
	if(res.statusCode===200){
		toast.success(res.message, {
			position: toast.POSITION.TOP_RIGHT
		});
	}else{
		console.log(res)
		if(res&&res.details){
			res.details.forEach(element => {
				console.log(element)
					toast.error(element.message, {
							position: toast.POSITION.TOP_RIGHT
					});
				 });
		 }else{
			toast.error(res.message, {
					position: toast.POSITION.TOP_RIGHT
			});
		 }
	
	}



})
  }
  cancelHandler=()=>{
	this.props.history.goBack()
  }

  render() {
	  console.log(this.state, this.props)
    return (                
			
			<section role="main" className="content-body">
				<header className={'page-header ' + (this.state.showMenu ? '' : 'header-left')}>
					<h2>Change Password</h2>
				</header>
				<div className="widget-content">
					<form className="form-horizontal" method="get">
						<div className="row form-group mb-4">						
								<label className="col-md-3 control-label text-right   mb-1" htmlFor="Status">Old Password</label>
								<div className="col-md-4">
								<div className="input-group">
									<span className="input-group-prepand">
										<span className="input-group-text">
											<i className="fas fa-lock"></i>
										</span>
									</span>
									<input type="password" className="form-control form-control-sm h30" placeholder="Old Password" name="old_password" onChange={e=>{this.setState({[e.target.name]:e.target.value})}}/>
								</div>
								</div>								
						</div>
						<div className="row form-group mb-4">						
								<label className="col-md-3 control-label text-right   mb-1" htmlFor="Status">New Password</label>
								<div className="col-md-4">
								<div className="input-group">
									<span className="input-group-prepand">
										<span className="input-group-text">
											<i className="fas fa-lock"></i>
										</span>
									</span>
									<input type="password" className="form-control form-control-sm h30" placeholder="New Password" name="new_password" onChange={e=>{this.setState({[e.target.name]:e.target.value})}}/>
								</div>
								</div>								
						</div>
						<div className="row form-group mb-4">						
								<label className="col-md-3 control-label text-right  mb-1" htmlFor="Status">Confirm Password</label>
								<div className="col-md-4">
								<div className="input-group">
									<span className="input-group-prepand">
										<span className="input-group-text">
											<i className="fas fa-lock"></i>
										</span>
									</span>
									<input type="password" className="form-control form-control-sm h30" placeholder="Confirm Password" name="confirm_password" onChange={e=>{this.setState({[e.target.name]:e.target.value})}}/>
								</div>
								</div>								
						</div>
						<div className="col-md-3 offset-md-3 form-group pl10">
									<button   className="btn btn-primary mr-1" type="button" onClick={e=>{this.ChangePassword(e)}}>Submit</button>
									<button className="btn btn-warning" onClick={()=>{this.props.history.goBack()}} type="button"   >Go Back</button>
							</div>
					</form>
				</div>
				<ToastContainer />
			</section>
			);
  }
}
