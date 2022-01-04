import React from "react";

import {
    Switch,
    Route,
    useRouteMatch,
    Redirect,
  } from "react-router-dom";
import PublicationsList from "../Admin/components/PublicationsList";
import ViewPublication from "../Admin/components/ViewPublication";

import Navigation from "./components/Navigation";

import './index.css';

const Viewer = () => {

    let { path, url } = useRouteMatch();

    return (
        <div className="viewer">
            <Navigation url={url} />
            <div className="ui container middle">
                <Switch>
                    <Route exact path={path}>
                      <Redirect to={`${path}/publications`}/>
                    </Route>
                    <Route exact path={`${path}/publications`}>
                        <PublicationsList/>
                    </Route>
                    <Route path={`${path}/publications/:id`}>
                        <ViewPublication/>
                    </Route>
                </Switch>
            </div>
        </div>       
    );  
};

export default Viewer;
