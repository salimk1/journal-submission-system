import React from "react";
import { Menu } from 'semantic-ui-react'

import UserNav from "../../../../components/UserNav";
import {
    NavLink
  } from "react-router-dom";

import './index.css';

const AdminNavigation = ({url}) => {

    return (
        <Menu>
            <Menu.Item to={`${url}/users`}
                as={NavLink}>
                Users
            </Menu.Item>
            <Menu.Item to={`${url}/publications`}
                as={NavLink}>
                Publications
            </Menu.Item>
            <Menu.Item to={`${url}/withdrawls`}
                as={NavLink}>
                Withdrawls
            </Menu.Item>            
            <UserNav />
        </Menu>   
    );  
};

export default AdminNavigation;
