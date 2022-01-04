import React from "react";

import {
    Switch,
    Route,
    useRouteMatch,
    Redirect
} from "react-router-dom";
import ViewPapers from "../Researcher/components/ViewPapers";
import ViewPaper from "../Researcher/components/ViewPaper";


import Navigation from "./components/Navigation";
import PublicationsList from "../Admin/components/PublicationsList";
import ViewPublication from "../Admin/components/ViewPublication";

import './index.css';

const Reviewer = () => {

    let { path, url } = useRouteMatch();

    return (
        <div className="reviewer">
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

export default Reviewer;
