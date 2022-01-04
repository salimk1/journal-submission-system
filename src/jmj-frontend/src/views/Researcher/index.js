import React from "react";

import {
    Switch,
    Route,
    useRouteMatch,
    Redirect
  } from "react-router-dom";

import Navigation from "./components/Navigation";
import ViewPapers from "./components/ViewPapers"
import ViewPaper from "./components/ViewPaper";
import EditPaper from "./components/EditPaper"

import './index.css';
import PublicationsList from "../Admin/components/PublicationsList";
import ViewPublication from "../Admin/components/ViewPublication";

const Researcher = () => {

    let { path, url } = useRouteMatch();

    return (
        <div className="researcher">
            <Navigation url={url} />
            <div className="ui container middle">
                <Switch>
                    <Route exact path={path}>
                        <Redirect to={`${path}/papers`} />
                    </Route>
                    <Route exact path={`${path}/papers`}>
                        <ViewPapers />
                    </Route>
                    <Route path={`${path}/papers/:id/view`}>
                        <ViewPaper />
                    </Route>
                    <Route path={`${path}/papers/:id/edit`}>
                        <EditPaper />
                    </Route>

                    <Route exact path={`${path}/publications`}>
                        <PublicationsList />
                    </Route>

                    <Route path={`${path}/publications/:id`}>
                        <ViewPublication />
                    </Route>
                </Switch>
            </div>
        </div>       
    );  
};

export default Researcher;
