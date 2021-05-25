
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Home from './components/Home';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Search from './components/Search'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Project from './components/ProjectPage'
import ProtectedRoute, { ProtectedRouteProps } from './protectedRoute'
import {  HelmetProvider } from 'react-helmet-async';

const staticData = {
  about: "Machine Learning Engineer at Intelligent Automation",
  age: 0,
  country: "UK",
  credit: 100,
  device: [],
  dob: "21/05/2021",
  email: "admin@mail.com",
  gender: "null",
  id: 1,
  is_admin: true,
  name: "Alden Smith",
  phone: "8092766691",
  photo: "static/profile_pictures/default.jpg",
  projects: [],
  username: "admin",
}

function App() {
  const defaultProtectedRouteProps: ProtectedRouteProps = {
    authType: 'user',
    authenticationPath: '/',
  };

  const AdminProtectedRouteProps: ProtectedRouteProps = {
    authType: 'admin',
    authenticationPath: '/home',
  };

  sessionStorage.setItem('loggeduser', JSON.stringify(staticData))
  sessionStorage.setItem('credit', JSON.stringify(staticData.credit))


  return (
    <HelmetProvider>

    <Router>
      <div className="App">
        <Switch>
          <Route
            {...defaultProtectedRouteProps}
            exact={true}
            path='/home'
            component={() => <Home />}
          />
          <ProtectedRoute
            {...AdminProtectedRouteProps}
            exact={true}
            path='/search'
            component={() => <Search />}
          />
          <ProtectedRoute
            {...defaultProtectedRouteProps}
            exact={true}
            path='/settings'
            component={() => <Settings />}
          />
          <ProtectedRoute
            {...defaultProtectedRouteProps}
            exact={true}
            path='/profile'
            component={() => <Profile />}
          />
          <ProtectedRoute
            {...defaultProtectedRouteProps}
            exact={true}
            path='/project'
            component={() => <Project />}
          />
          <Route exact path='/sign-up'><Signup /></Route>
          <Route path='/'><Login /></Route>
        </Switch>
        <ToastContainer />
      </div>
    </Router>
    </HelmetProvider>
  );
}

export default App;
