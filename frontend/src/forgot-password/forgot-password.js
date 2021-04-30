// import React, { Component } from 'react';
// import logoImage from '../assets/images/logo-web.png'
// import '../assets/css/theme.css'
// import '../assets/css/skins/default.css'
// import { connect } from "react-redux";
// import { withRouter } from "react-router";

// import * as auth from "../actions/auth.action";
// import store from '../store';
// import { ToastContainer, toast } from 'react-toastify';
// import * as authAction from "../actions/auth.action";
//   class ForgotPassword extends Component {
  
//   constructor(props){
//     super(props);      
// this.state={
// 	email:""
// }
// 	}
// 	sendOTP=()=>{
//  if(this.state.email!==""){
// 	authAction.sendOPT(this.state.email).then(res=>{
// 		if(res.statusCode===200){
// 			toast.success(res.message+'please check your mail', {
// 				position: toast.POSITION.TOP_RIGHT
// 		});
// setTimeout(() => {
// 	this.props.history.push('/reset-password')
// }, 2000);
// 	}else{
// 			toast.error(res.message, {
// 				position: toast.POSITION.TOP_RIGHT
// 		});
// 		 }
// 	})
//  }else{
// 	toast.error("Please enter Email", {
// 		position: toast.POSITION.TOP_RIGHT
// });
//  }
  	
// 	}
// 	handleChange=(e)=>{
// this.setState({[e.target.name]:e.target.value})
// 	}
//   render() {
//     return (                
// 		<section className="body-sign">
// 			<div className="center-sign">
// 				{/* <p className="text-center mt-3 mb-3">This is a demo login screen, no Username or Password required.<br/>Click the "Sign In" button below to continue.</p> */}
//                 <a href="" className="logo float-left"><img src={logoImage} height="54" alt="VLIS" /></a>
// 				<div className="panel card-sign">
// 					<div className="card-title-sign mt-0 text-right">
// 						<h2 className="title text-uppercase font-weight-bold m-0"><i className="fas fa-envelope mr-1"></i> Forgot Password</h2>
// 					</div>
// 					<div className="card-body">
// 						<form name="authform" method="post">
// 							<div className="form-group mb-3">
// 								<div className="clearfix">
// 									<label className="float-left">Email</label>
// 								</div>
// 								<div className="input-group">
// 									<input name="pwd" type="email" name="email" className="form-control form-control-lg" value={this.state.email} onChange={e=>{this.handleChange(e)}} placeholder="Enter email" name="email"/>
// 									<span className="input-group-append">
// 										<span className="input-group-text">
// 											<i className="fas fa-envelope"></i>
// 										</span>
// 									</span>
// 								</div>
// 							</div>
// 							<div className="form-group text-right">
// 									<button className="btn btn-primary mt-2" type="button" onClick={e=>this.sendOTP()}>Submit</button>
//  							</div>
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
// const mapStateToProps = (state) => {
// 	return {
			
// 	}
// }
// const mapDispatchToProps = (dispatch) => {
// 	return {
// 			// updateUser: (id,userObj) => {
// 			//         dispatch(userAction.updateUser(id,userObj))
// 			// },
// 			// gropuingAction:()=>{dispatch(gropuingAction.getGroupings())},


// 	}
// }
// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForgotPassword));