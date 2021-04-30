// import React, { Component } from 'react';
// import logoImage from '../assets/images/logo-web.png'
// import '../assets/css/theme.css'
// import '../assets/css/skins/default.css'; 
// import { withRouter } from "react-router"; 
// import { connect } from "react-redux";
// import * as authAction from "../actions/auth.action";
// import * as userAction from "../actions/user.action";
// import { headers } from "../config";
//   import { ToastContainer, toast } from 'react-toastify';

// export class Login extends Component {
  
//   constructor(props){
//     super(props);
//     this.state = {
//       email:"",
//       password:"",
//       checked: true, 
//       fields: {},
//       errors: {},
//       users:{}
//     };        

//   }

//   componentDidMount(){
//     if(localStorage.getItem("intelliscope-token")){
//       this.props.history.push('/patient_management')
//     }
//   }

//   handleValidation(){
//     if(this.state.email===""||this.state.password===""){
//       return false
//     }else{
//       return true;
//     }
//   }

//   handleCheck = () => {
//     this.setState({checked: !this.state.checked});
//   }  

//   authSubmit=(e)=>{
//     e.preventDefault();     
//     if(this.handleValidation()){
//  let obj={
//   email:this.state.email,
//   password:this.state.password
//  }
//      authAction.login(obj).then(res=>{
//         if(res.status.status===200){
//          let user={
//           userId:res.userId,
//           userType:res.userType
//          }
//         localStorage.setItem("intelliscope-token",res.token)
//         localStorage.setItem("user",user)
//         headers.headers.Authorization="JWT "+res.token
//          this.props.getMyProfile()
        
//       if(user.userType===2||user.userType===1){
//         toast.error("You are not allow to login", {
//           position: toast.POSITION.TOP_RIGHT
//       });
//       }else{
//         toast.success("Login success", {
//           position: toast.POSITION.TOP_RIGHT
//       });
//         setTimeout(() => {
//           console.log("@@@@@")
//           this.props.history.push('/patient_management')
//          }, 1000);
//       }
//        }else{
//          toast.error( res.message, {
//           position: toast.POSITION.TOP_RIGHT
//       });     
//       }
//      })
//     }else{
//        toast.error( "Pease enter username and password", {
//         position: toast.POSITION.TOP_RIGHT
//     });    
//     }

//   }

//   handleChange=(e)=>{    
//     if(e.target.name==="email"){
//       let mailValidation=e.target.value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
//       if(mailValidation){
//         this.setState({validationError:"Email is not valid"})
//       }
//       }
//      if(e.target.name==="password"){
//       let PasswordValidation=e.target.value.length>6
//       if(PasswordValidation){
//         this.setState({validationError:"Password must be more then 6 charecter"})
//       }
//       }		  
//     this.setState({[e.target.name]:e.target.value})	
//   }

//   render() {
//     return (                
// 		<section className="body-sign">
// 			<div className="center-sign">
// 				<p className="text-center mt-3 mb-3">This is a demo login screen, no Username or Password required.<br/>Click the "Sign In" button below to continue.</p>
//                 <a  className="logo float-left"><img src={logoImage} height="54" alt="VLIS" /></a>
// 				<div className="panel card-sign">
// 					<div className="card-title-sign mt-0 text-right">
// 						<h2 className="title text-uppercase font-weight-bold m-0"><i className="fas fa-user mr-1"></i> Sign In</h2>
// 					</div>
// 					<div className="card-body">
// 						<form name="authform" method="post" >
// 							<div className="form-group mb-3">
// 								<label>Email</label>
// 								<div className="input-group">
// 									<input name="username" type="text" className="form-control form-control-lg" placeholder="Username"name="email" onChange={this.handleChange} value={this.state.email}/>
// 									<span className="input-group-append">
// 										<span className="input-group-text">
// 											<i className="fas fa-user"></i>
// 										</span>
// 									</span>
// 								</div>
// 							</div>
             
// 							<div className="form-group mb-3">
// 								<div className="clearfix">
// 									<label className="float-left">Password</label>
// 								</div>
// 								<div className="input-group">
// 									<input name="pwd" type="password" className="form-control form-control-lg" placeholder="Password" name="password" onChange={this.handleChange} value={this.state.password}/>
// 									<span className="input-group-append">
// 										<span className="input-group-text">
// 											<i className="fas fa-lock"></i>
// 										</span>
// 									</span>
// 								</div>
// 							</div>
// 							<div className="row">
// 								<div className="col-sm-8">
// 									<div className="checkbox-custom checkbox-default">
// 										<input type="checkbox" onChange={this.handleCheck} defaultChecked={this.state.checked} />
// 										<label>Remember Me</label>
// 									</div>
// 								</div>
// 								<div className="col-sm-4 text-right">
// 									<button id="submit" onClick= {e=>this.authSubmit(e)} value="Submit" className="btn btn-primary mt-2">Sign In</button>
// 								</div>
// 							</div>
// 						</form>
// 					</div>
// 				</div>
//         <div className="text-center  mt10" onClick={e=>{this.props.history.push('/forgot-password')}}>Forgot Password</div>
// 				<p className="text-center text-muted mt-3 mb-3">&copy; Copyright 2019. All Rights Reserved.</p>
// 			</div>
//       <ToastContainer />
// 		</section>          
//     );
//   }
// }



  
// function mapStateToProps(state) {
//   return{
    
//    }
// }

// function mapActionToProps(dispatch) {
//   return {
//     getMyProfile:(obj)=>{dispatch(userAction.getMyProfile())}
//    };
// }

  
// export default withRouter(connect(mapStateToProps, mapActionToProps)(Login));
