
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Task from './components/Task';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Search from './components/Search'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
          <ProtectedRoute
            {...defaultProtectedRouteProps}
            exact={true}
            path='/home'
            component={() => <Task />}
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
          <Route exact path='/sign-up'><Signup /></Route>
          <Route path='/'><Login /></Route>
        </Switch>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
