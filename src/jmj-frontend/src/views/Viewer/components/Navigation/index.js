import React from "react";
import { Menu } from 'semantic-ui-react'

import UserNav from "../../../../components/UserNav";
import {
    NavLink
  } from "react-router-dom";

import './index.css';

const ViewerNavigation = ({url}) => {

    return (
        <Menu>
            <Menu.Item to={`${url}/publications`}
                as={NavLink}>
                Publications
            </Menu.Item>
            <UserNav />
        </Menu>   
    );  
};

export default ViewerNavigation;
