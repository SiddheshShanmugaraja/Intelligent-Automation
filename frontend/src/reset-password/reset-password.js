// import React, { Component } from 'react';
// import logoImage from '../assets/images/logo-web.png'
// import '../assets/css/theme.css'
// import '../assets/css/skins/default.css'
// import { connect } from "react-redux";
// import * as auth from "../actions/auth.action";
// import store from '../store';
//  import {toastr} from 'react-redux-toastr'
//  import * as authAction from "../actions/auth.action";
//  import { ToastContainer, toast } from 'react-toastify';

// export default class ResetPassword extends Component {
  
//   constructor(props){
//     super(props);      
// 		this.state={
// 			password:"",
// 			otp:"",
// 			confirm_password:""

// 		}
//   }
// 	changePassoword=()=>{
// 		let obj={
// 			new_password:this.state.password,
// 			token:this.state.otp,
// 			confirm_password:this.state.confirm_password,
// 		}
// 		console.log(obj)
// 		if(obj.new_password===obj.confirm_password){
// 			authAction.reset_password(obj).then(res=>{
// 				console.log(res)
// 				if(res.statusCode===200){
// 					toast.success(res.message, {
// 						position: toast.POSITION.TOP_RIGHT
// 				});
// setTimeout(() => {
// 	this.props.history.push('/')
// }, 1000);
// 			}else{
// 					if(res.message.details){
// 						res.message.details.forEach(element => {
// 								toast.error(element.message, {
// 										position: toast.POSITION.TOP_RIGHT
// 								});
// 							 });
// 					 }else{
// 						toast.error("OTP expired please generate new OTP", {
// 								position: toast.POSITION.TOP_RIGHT
// 						});
// 					 }
// 				}
	
// 			})
// 		}else{
// 			toast.error("Password and Confirm password must be same ", {
// 				position: toast.POSITION.TOP_RIGHT
// 		});
// 		}
	
// 	}
//   render() {
//     return (                
// 		<section className="body-sign">
// 			<div className="center-sign">
// 				{/* <p className="text-center mt-3 mb-3">This is a demo login screen, no Username or Password required.<br/>Click the "Sign In" button below to continue.</p> */}
//                 <a href="" className="logo float-left"><img src={logoImage} height="54" alt="VLIS" /></a>
// 				<div className="panel card-sign">
// 					<div className="card-title-sign mt-0 text-right">
// 						<h2 className="title text-uppercase font-weight-bold m-0"><i className="fas fa-lock mr-1"></i> Reset Password</h2>
// 					</div>
// 					<div className="card-body">
// 						<form name="authform" method="post">
// 						<div className="form-group mb-3">
// 								<div className="clearfix">
// 									<label className="float-left">One Time Passwod</label>
// 								</div>
// 								<div className="input-group">
// 									<input name="pwd" type="number" className="form-control form-control-lg" value={this.state.otp} onChange={e=>{this.setState({otp:e.target.value})}}  placeholder="Enter OTP" name="otp"/>
								 
// 								</div>
// 							</div> 

// 							<div className="form-group mb-3">
// 								<div className="clearfix">
// 									<label className="float-left">New Password</label>
// 								</div>
// 								<div className="input-group">
// 									<input name="pwd" type="password" className="form-control form-control-lg" value={this.state.password} onChange={e=>{this.setState({password:e.target.value})}} placeholder="New Password" name="password"/>
// 									<span className="input-group-append">
// 										<span className="input-group-text">
// 											<i className="fas fa-lock"></i>
// 										</span>
// 									</span>
// 								</div>
// 							</div>
// 							<div className="form-group mb-3">
// 								<div className="clearfix">
// 									<label className="float-left">Confirm Password</label>
// 								</div>
// 								<div className="input-group">
// 									<input name="pwd" type="password" className="form-control form-control-lg" value={this.state.confirm_password} onChange={e=>{this.setState({confirm_password:e.target.value})}} placeholder="Confirm Password" name="confirm_password"/>
// 									<span className="input-group-append">
// 										<span className="input-group-text">
// 											<i className="fas fa-lock"></i>
// 										</span>
// 									</span>
// 								</div>
// 							</div>
// 							<div className="form-group text-right">
// 									<button id="" className="btn btn-primary mt-2" type="button" onClick={e=>this.changePassoword()} >Submit</button>
// 							</div>
// 						</form>
// 					</div>
// 				</div>
// 				<div className="text-center   mt10" onClick={e=>{this.props.history.push('/')}}>Go to login</div>
// 				<p className="text-center text-muted mt-3 mb-3">&copy; Copyright 2019. All Rights Reserved.</p>
// 			</div>
// 			<ToastContainer />
// 		</section>          
//     );
//   }
// }
