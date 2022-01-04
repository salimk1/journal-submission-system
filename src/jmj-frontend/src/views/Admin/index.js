import React from "react";

import {
    Switch,
    Route,
    useRouteMatch,
    Redirect
  } from "react-router-dom";

import Navigation from "./components/Navigation";
import UserList from "./components/UsersList";
import ViewUser from "./components/ViewUser";
import EditUser from "./components/EditUser";
import PublicationsList from "./components/PublicationsList";
import EditPublication from "./components/EditPublication";
import ViewPublication from "./components/ViewPublication";
import ViewWithdrawls from "./components/ViewWithdrawls";

import './index.css';

const Admin = () => {

    let { path, url } = useRouteMatch();

    return (
        <div className="admin"> 
            <Navigation url={url} />
            <div className="ui container middle">
                <Switch>
                    <Route exact path={path}>
                        <Redirect to = {`${path}/users`} />
                    </Route>
                    <Route exact path={`${path}/users`}>
                        <UserList />
                    </Route>

                    <Route exact path={`${path}/users/:id`}>
                        <Redirect to={`${path}/users/:id/view`} />
                    </Route>
                    <Route path={`${path}/users/:id/view`}>
                        <ViewUser />
                    </Route>
                    <Route path={`${path}/users/:id/edit`}>
                        <EditUser />
                    </Route>

                    <Route exact path={`${path}/publications`}>
                        <PublicationsList />
                    </Route>
                    <Route path={`${path}/publications/:id/view`}>
                        <ViewPublication />
                    </Route>
                    <Route path={`${path}/publications/:id/edit`}>
                        <EditPublication />
                    </Route>


                    <Route path={`${path}/withdrawls`}>
                        <ViewWithdrawls />
                    </Route>                    

                </Switch>
            </div>
        </div>       
    );  
};

export default Admin;
