import React, { Component } from 'react';
import Header from './header/header'
import Sidemenu from './sidemenu/sidemenu'
import Rightsidemenu from './sidemenu/right-sidemenu'
import { withRouter } from 'react-router-dom'

class Layout extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false,
            showRightMenu:false
        };
    }

    toggleMenu = () =>{
         this.setState({
            showMenu: !this.state.showMenu
        });
        this.props.stateChange(this.state.showMenu);
    }

    toggleRightMenu = () =>{
        this.setState({
            showRightMenu   : !this.state.showRightMenu
       });
       this.props.toggleRightMenu(this.state.showRightMenu);
   }

    render() {
 
        return (

            <div >
                <Sidemenu showMenu={this.state.showMenu}  toggleMenu={this.toggleMenu}   />
                
                <div  className={' '+(this.props.showRightMenu===true?' push-right': '')}>
                <Header  showRightMenu={this.state.showRightMenu} />
                </div>
                <Rightsidemenu showRightMenu={this.props.showRightMenu}  toggleRightMenu={this.toggleRightMenu}   />

            </div>

        )
    }
}
export default withRouter(Layout);