import React from "react";
import { Menu } from 'semantic-ui-react'

import UserNav from "../../../../components/UserNav";
import {
    NavLink
  } from "react-router-dom";

import './index.css';

const ReviewerNavigation = ({url}) => {

    return (
        <Menu>
            <Menu.Item exact to={`${url}`}
                as={NavLink}>
                My Papers to review
            </Menu.Item>
            <Menu.Item exact to={`${url}/publications`}
                as={NavLink}>
                Publications
            </Menu.Item>
            <UserNav />
        </Menu>   
    );  
};

export default ReviewerNavigation;
