import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUser, login } from "../../store/actions/user";
import { selectUser } from "../../store/selectors/user";
import { Form, Button } from "semantic-ui-react";
import API from "../../utils/API";
import { IoRemoveCircle } from "react-icons/io5";
import { Redirect } from "react-router-dom"

import './index.css';

const user_types = [
    { key: 'researcher', text: 'Researcher', value: 'researcher'},
    { key: 'viewer', text: 'Viewer', value: 'viewer'},
    { key: 'reviewer', text: 'Reviewer', value: 'reviewer'},
];

const Register = ({props}) => {

    const user = useSelector(selectUser);
	const dispatch = useDispatch();

    const [ userData, setUserData] = useState({
        email:'',
        first_name:'',
        last_name:'',
        password:'',
        passwordConfirmation:'',
        type:'',
        degrees:[]
    });   
    const [ error, setError ] = useState({});

    useEffect(() => {
		dispatch(getUser());
	})
    
    useEffect(() => {
        if (userData.type === 'researcher' && userData.degrees.length === 0)
        setUserData({
            ...userData,
            degrees: [ 
                { 
                    title:'',
                    institution:'',
                    received:''
                }
            ]
            });

        if ( userData.type !== 'researcher' && userData.degrees.length > 0)
            setUserData({
            ...userData,
                degrees: [ ]
            });
           

    }, [userData, userData.degrees.length, userData.type]);

    const handleChange = (e, {name, value}) => {
        setUserData(userData => ({           
            ...userData,
            [name]: value            
        }));
    }

    const handleDegreeChange = (e, {name, value}) => {
        let names = name.split('_');
        if (names.length !== 2)
            return;

        let field = names[0];
        let index = parseInt(names[1]);

        if (isNaN(index))
            return;

        setUserData(userData => {
            return {
                ...userData,
                degrees:userData.degrees.map((deg,i) => i === index ? {
                    ...deg,
                    [field]:value
                } : deg)
            }
        });
    }

    const handleSubmit = e =>{
        e.preventDefault();
        API.post('/register', userData).then(res => {
            if ( res.data && res.data.user ) {
                dispatch(login({
                    email: res.data.user.email,
                    first_name: res.data.user.first_name,
                    last_name: res.data.user.last_name,
                    type: res.data.user.type,
                }))
            }
        }).catch(( error ) => {
            setError(error?.response?.data?.errors);
        });
    }

    if (user !== null)
		return <Redirect to={props?.location?.state?.from?.pathname? 
							props.location.state.from.pathname : `/${user.type}`} />

    return (
        <div className="register ui middle aligned center aligned grid"> 
            <div className="column">
                <h2 className="ui teal image header">
                    <div className="content">
                    Register 
                    </div>
                </h2>
            <Form onSubmit={handleSubmit}
                className="ui large form" >
                <Form.Field>
                    <label className="white">Email</label>
                    <Form.Input type="email"
                                name="email"
                                value={userData.email}
                                error={ error && error.email && 
                                    { content: error.email.join(' & ') }}
                                placeholder="Enter your email"
                                onChange={handleChange} />
                </Form.Field>
                <Form.Field>
                <label className="white">First Name</label>
                   <Form.Input type="text"
                            name="first_name"
                            value={userData.first_name}
                            error={ error && error.first_name && 
                                { content: error.first_name.join(' & ') }}
                            placeholder="In here with your name, your first name"
                            onChange={handleChange} />                 
                </Form.Field> 
                <Form.Field>
                <label className="white">Last Name</label>     
                <Form.Input type="text"
                            name="last_name"
                            value={userData.last_name}
                            error={ error && error.last_name && 
                                { content: error.last_name.join(' & ') }}
                            placeholder="Your last name here"
                            onChange={handleChange} /> 
                </Form.Field>
                <Form.Field>
                <label className="white">Password</label>
                    <Form.Input type="password"
                            name="password"
                            value={userData.password}
                            error={ error && error.password && 
                                { content: error.password.join(' & ') }}
                            placeholder="Choose your password"
                            onChange={handleChange} />
                </Form.Field>
                <Form.Field>
                    <label className="white">Confirm Password</label>
                    <Form.Input type="password"
                            name="passwordConfirmation"
                            value={userData.passwordConfirmation}
                            error={ error && error.password && 
                                { content: error.passwordConfirmation.join(' & ') }}
                            placeholder="Type it in here again, in case you fucked up before"
                            onChange={handleChange} />              
                </Form.Field>
                <Form.Field>
                    <label className="white">User Type</label>
                    <Form.Select
                        placeholder="Select user type"
                        name="type"
                        value={userData.type}
                        options={user_types}
                        onChange={handleChange} />          
                </Form.Field>

                                                           
                { userData.type === "researcher" && userData.degrees.map( (degree , i) => 
                    <Form.Group key={i}
                                className="ui container grid middle degree">
                        <Form.Field>
                            <label className="white">Title</label>
                            <Form.Input  type="text"
                                    name={`title_${i}`}
                                    value={userData.degrees[i].title}
                                    error={ error && error['degree_'+ i] && 
                                            error['degree_'+ i].title && 
                                            { content:error['degree_'+ i].title.join(' & ') }}
                                    onChange={handleDegreeChange}
                                    placeholder="As bestowth upon you" />
                        </Form.Field>
                        <Form.Field>
                            <label className="white">Date received</label>
                            <Form.Input  type="date"
                                    name={`received_${i}`}
                                    value={userData.degrees[i].received}
                                    error={ error && error['degree_'+ i] && 
                                            error['degree_'+ i].received && 
                                            { content:error['degree_'+ i].received.join(' & ') }}
                                    onChange={handleDegreeChange}
                                    placeholder="How long ago?" />

                        </Form.Field>
                        <Form.Field>
                            <label className="white">Institution</label>
                            <Form.Input  type="text"
                                    name={`institution_${i}`}
                                    value={userData.degrees[i].institution}
                                    error={ error && error['degree_'+ i] && 
                                            error['degree_'+ i].institution && 
                                            { content:error['degree_'+ i].institution.join(' & ') }}
                                    onChange={handleDegreeChange}
                                    placeholder="By this authority" />
                        </Form.Field>  
                        { i > 0 && 
                        <Form.Field className="remove-field">
                            <Button
                                type="button"
                                className="remove-row"
                                animated='vertical'
                                onClick={(e) => {
                                    setUserData({
                                        ...userData,
                                        degrees: userData.degrees.filter((degree, index ) => index !== i)
                                    })
                                }} >
                                <Button.Content hidden>Remove</Button.Content>
                                <Button.Content visible>
                                <IoRemoveCircle />
                                </Button.Content>                            
                            </Button>   
                        </Form.Field> }                 
                    </Form.Group> )}
                { userData.type === "researcher" &&
                    <Form.Button type="button" 
                                 onClick={(e) => { setUserData({
                                    ...userData,
                                    degrees: userData.degrees.concat({
                                        title:'',
                                        institution:'',
                                        received:''
                                    })})}}>
                        Add Degree
                    </Form.Button>}
                    <Form.Button content="Submit" />
            </Form>
            </div>                       
        </div>
    );  
};

export default Register;
