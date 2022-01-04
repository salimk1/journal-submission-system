import React from "react";
import { Menu } from 'semantic-ui-react'

import UserNav from "../../../../components/UserNav";
import {
    NavLink
  } from "react-router-dom";

import './index.css';

const EditorNavigation = ({url}) => {

    return (
        <Menu>
            <Menu.Item exact to={`${url}/papers`}
                as={NavLink}>
                Papers
            </Menu.Item>
            <Menu.Item exact to={`${url}/researchers`}
                as={NavLink}>
                Researchers
            </Menu.Item>
            <Menu.Item exact to={`${url}/reviewers`}
                as={NavLink}>
                Reviewers
            </Menu.Item>
            <Menu.Item exact to={`${url}/signups`}
                as={NavLink}>
                Sign-ups
            </Menu.Item>
            <Menu.Item exact to={`${url}/publications`}
                as={NavLink}>
                Publications
            </Menu.Item>
            <UserNav />
        </Menu>   
    );  
};

export default EditorNavigation;
