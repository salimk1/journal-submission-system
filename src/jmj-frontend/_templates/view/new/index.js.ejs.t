---
to: src/views/<%= Name %>/index.js
---
import React from "react";

import {
    Switch,
    Route,
    useRouteMatch
  } from "react-router-dom";

import Home from "./components/Home";
import Navigation from "./components/Navigation";

import './index.css';

const <%= Name %> = () => {

    let { path, url } = useRouteMatch();

    return (
        <div className="<%= h.changeCase.paramCase(name) %>">
            <Navigation url={url} />
            <div className="ui container middle">
                <Switch>
                    <Route exact path={path}>
                        <Home />
                    </Route>
                    <Route path={`${path}/example`}>
                        Make it go
                    </Route>
                </Switch>
            </div>
        </div>       
    );  
};

export default <%= Name %>;
