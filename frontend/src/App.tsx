
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

function App() {
  const defaultProtectedRouteProps: ProtectedRouteProps = {
    authType: 'user',
    authenticationPath: '/',
  };

  const AdminProtectedRouteProps: ProtectedRouteProps = {
    authType: 'admin',
    authenticationPath: '/home',
  };
  return (
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
  );
}

export default App;
