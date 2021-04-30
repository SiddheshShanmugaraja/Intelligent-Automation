import React, { Component }  from 'react';
import {  Router, Route, Switch } from 'react-router-dom';
 import { Provider} from "react-redux";
import store from "./store";
import './App.scss';
import TrainingModel from './components/training_model';

import Layout from './layout/layout';
import {history} from './_helpers/history'


// const App = () => (
  class App extends Component {
    constructor(props) {
      super(props);
       this.state = {
          showMenu: true,
          showRightMenu:false
      };
      this.stateChange = this.stateChange;
  }

  stateChange = (showMenu) => {
    console.log(this.state.showMenu,this.state.showRightMenu)

      this.setState({
          showMenu: showMenu,
          showBar:false
      });
  };
  toggleRightMenu=(showRightMenu )=>{
    console.log(this.state.showMenu,this.state.showRightMenu)
    this.setState({
      showRightMenu: showRightMenu
  });
    
  }
  showBar=()=>{
    
    this.setState({
      showBar: !this.state.showBar
  },()=>{
    console.log(this.state.showBar)
  });
  }
  render() {

     return (
  <Provider store={store}>
  <Router  history={history}>
    <section className={"fixed has-left-sidebar-half flexbox flexboxlegacy csstransforms  no-overflowscrolling    no-mobile-device custom-scroll "+(this.state.showMenu===true?
    "sidebar-left-collapsed":"")+(this.state.showBar===true?" inner-menu-opened":"")+(this.state.showRightMenu === true? " rightsidebar-open":"")}>

    {/* 
    when show bar clicked 
    ------------------------
    -  add class - 'inner-menu-opened' 

    when hide bar clicked 
    ------------------------
    -  Remove class - 'inner-menu-opened' 
    */}

    {/* 
    to close main sidebar 
    ---------------------
    -  add class -  'sidebar-left-collapsed'
    
    to Open main sidebar
    ---------------------
    -  Remove class -  'sidebar-left-collapsed'

  */}

    {/* fixed sidebar-left-collapsed inner-menu-opened  */}
    {/* */}
      <main>
        <Switch>
          {/* <Route exact path="/" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} /> 
          <Route path="/lock-screen" component={LockScreenComponent} />  */}
 
              
             <Route exact={true} path='/' render={() => (
              <div>
                  <Layout stateChange={this.stateChange} showRightMenu={this.state.showRightMenu}  toggleRightMenu={e=>{this.toggleRightMenu(e)}}  />
                  <div className={ (this.state.showRightMenu===true ? 'rightsideopen' : 'rightsideclosed' )+'  ' + (this.state.showMenu ? 'sidebaropen' : 'sidebarclosed')  }>
                      <TrainingModel showBar ={e=>{this.showBar(e)}} history={history} showMenu={this.state.showMenu} toggleRightMenu={e=>{this.toggleRightMenu(e)}} showRightMenu={this.state.showRightMenu} toggleRightMenu={e=>{this.toggleRightMenu(e)}} />
                      
                  </div>
              </div>
          )} />
             
              
       
 
        </Switch>
      </main>
    </section>
  </Router>
  </Provider>
);
          }
        }

export default App;