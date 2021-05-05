import { Redirect, Route, RouteProps } from 'react-router';
export type ProtectedRouteProps = {
    authType: string;
    authenticationPath: string;
} & RouteProps;

export default function ProtectedRoute({ authType, authenticationPath, ...routeProps }: ProtectedRouteProps) {
    let loggeduser = JSON.parse(sessionStorage.getItem('loggeduser') || '{}')
    if (authType === 'admin' && loggeduser['is_admin']) {
        return <Route {...routeProps} />;
    } else if (authType === 'user' && loggeduser['username']) {
        return <Route {...routeProps} />;
    }
    else {
        return <Redirect to={{ pathname: authenticationPath }} />;
    }
}