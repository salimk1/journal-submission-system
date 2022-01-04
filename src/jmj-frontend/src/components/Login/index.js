import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUser, login } from "../../store/actions/user";
import { selectUser } from "../../store/selectors/user";
import { Redirect } from "react-router-dom";
import API from "../../utils/API";

import { Form } from 'semantic-ui-react';

import './index.css';

const Login = (props) => {

    const user = useSelector(selectUser);
	const dispatch = useDispatch();
	
	const [ loginInfo, setLoginInfo ] = useState({
		email:'',
		password:'',
	});

	const [ error, setError ] = useState({});
	
	useEffect(() => {
		dispatch(getUser());
	})

	const handleSubmit = (e) => {
		e.preventDefault();

		API.get('/sanctum/csrf-cookie').then(response => {
			API.post('/login', loginInfo ).then(res=>{
				if ( res.data && res.data.user ) {
					dispatch(login({
						email: res.data.user.email,
						firstName: res.data.user.first_name,
						lastName: res.data.user.last_name,
						type: res.data.user.type,
					}))
				}
			}).catch(e=>{
				if(e.response?.data?.errors)
					setError(e.response.data.errors)
			})
		});
	}

	const handleChange = (e, {name, value}) => {
	    setLoginInfo( loginInfo => ({
			...loginInfo,
			[name]: value
		}));
	}

	if (user !== null)
		return <Redirect to={props?.location?.state?.from?.pathname? 
							props.location.state.from.pathname : `/${user.type}`} />

    return (
       <div className="login">
       <div className="ui container middle">
            <Form onSubmit={handleSubmit}>
                <Form.Field>
                    <label>Email</label>
                    <Form.Input placeholder='Email' 
								name="email"
								type="email"
								value={loginInfo.email}
								error={ error && error.email && 
                                    { content: error.email.join(' & ') }}
                            	onChange={handleChange}/>
                </Form.Field>
                <Form.Field>
                    <label>Password</label>
					<Form.Input placeholder='Password' 
								name="password"
								type="password"
								value={loginInfo.password}
								error={ error && error.password && 
                                    { content: error.password.join(' & ') }}
                            	onChange={handleChange}/>
                </Form.Field>
                <Form.Button type='submit' primary>Submit</Form.Button>
            </Form>
        </div>
        </div>
    );  
};

export default Login;
