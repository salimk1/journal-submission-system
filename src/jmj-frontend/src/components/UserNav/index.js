import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../store/selectors/user";
import { logout } from "../../store/actions/user";
import './index.css';
import { Menu, Dropdown } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import API from "../../utils/API";

const UserNav = () => {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const handleLogout = e => {        
        API.get('/logout').then(response => {
            dispatch(logout());
        }).catch(err => {

        })
    }

    return (
        <>
        <Menu.Item to={`/${user.type}/evaluation_metrics`}
            as={NavLink}>
            Evaluation Metrics
        </Menu.Item>
        <Menu.Menu position='right'>
            { user && <>            
            <Dropdown item text={user.firstName + ' ' + user.lastName}>
                <Dropdown.Menu>
                    <Dropdown.Item exact to={`/${user.type}/user/tokens`} 
                            as={NavLink}>
                            Tokens
                    </Dropdown.Item>
                    <Dropdown.Item text="Logout"  onClick={handleLogout}/>
                </Dropdown.Menu>
            </Dropdown>
            </>}
        </Menu.Menu>
        </>
    );  
};

export default UserNav;
