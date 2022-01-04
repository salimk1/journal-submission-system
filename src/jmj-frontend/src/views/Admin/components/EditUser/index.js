import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom";
import API from '../../../../utils/API';
import { 
    Container, 
    Header,
    Loader, 
    Table, 
    Icon, 
    Button, 
    Segment,
    Form, 
} from 'semantic-ui-react';

import './index.css';

const user_types = [
    { key: 'researcher', text: 'Researcher', value: 'researcher'},
    { key: 'viewer', text: 'Viewer', value: 'viewer'},
    { key: 'reviewer', text: 'Reviewer', value: 'reviewer'},
    { key: 'editor', text: 'Editor', value: 'editor'},
    { key: 'admin', text: 'Admin', value: 'admin'},
];

const user_statuses = [
    { key: 'approved', text: 'Approved', value: 'approved'},
    { key: 'awaiting', text: 'Awaiting', value: 'awaiting'},
];

const degree_template = { 
    title:"",
    received:"",
    institution:"",
}
const user_template = { 
    first_name:	"",
    last_name:	"",
    type:	"",
    email:	"",
    admin_email: "",
    status:	"",
    password:"",
}

const EditUser = () => {

    let { id } = useParams();
    let history = useHistory();

    const [ fetch, setFetch ] = useState(true);
    const [ fetchDegrees, setFetchDegrees ] = useState(false);
    const [ user, setUser ] = useState(user_template);
    const [ degrees, setDegrees ] = useState([]);
    const [ error, setError ] = useState({});
    const [ changed, setChanged ] = useState({});
    const [ newDegree, setNewDegree ] = useState(false);
    const [ degreeError, setDegreeError ] = useState({});
    const [ degree, setDegree ] = useState(degree_template);
     
    const newUser = id === 'new'
    
    useEffect(() => {
        if(!newUser && fetch){
            setFetch(false);
            API.get(`/api/users/${id}`).then((response) => {
                if (response.data.user) {
                    setUser(response.data.user);

                    if (response.data.user.type === 'researcher')
                        setFetchDegrees(true);
                }

            }).catch((error) => {
                console.log(error.response);
            })
        }
    },[fetch, id, newUser]);

    useEffect(() => {
        if (!newUser && fetchDegrees && user?.type === 'researcher') {
            setFetchDegrees(false);
            API.get(`/api/users/${id}/degrees`).then((response => {
                if (response.data.degrees)
                    setDegrees(response.data.degrees);
            })).catch((error) => {
                console.log(error);
            })
        }

    }, [user, fetchDegrees, id, newUser]);

    const handleChange = (e, {name, value}) => {
        setUser({
            ...user,
            [name]: value
        })
        if (!newUser)
            setChanged({
                ...changed,
                [name]: true
            });
        else 
            setChanged({new_user:true})
    }

    const handleDegreeChange = (e, {name, value}) => {
        setDegree({
            ...degree,
            [name]:value
        })
    }

    const addDegree = () => {
        API.post(`/api/users/${id}/degrees/new`, degree).then(response => {
            if (response.data.success){
                setDegrees([...degrees, degree]);
                setDegree(degree_template);
                setNewDegree(false);
            }
        }).catch(err => {
            if (err.response.data.errors)
                setDegreeError(err.response.data.errors);
        })
    }   

    const removeDegree = degree_id => {
        API.post(`/api/users/${id}/degrees/delete`, {
            degree_id:degree_id
        }).then(response => {
            if (response.data.success){
                setDegrees(degrees.filter(d => d.id !== degree_id));
            }
        }).catch(err => {
            console.log(err);
        })
    }

    const saveField = (name, value) => { 
        API.post(`/api/users/${id}/edit`, {
            [name]:value
        }).then((response) => {
            if(response.data.success) {
                setChanged({
                    ...changed,
                    [name]:false
                })
                setError({
                    ...error,
                    [name]:false
                })
            }
        }).catch((error) => {
            if (error.response.data.errors)
                setError(error.response.data.errors);            
        })
    }

    const saveAll = (e) => {
        API.post(`/api/users/${newUser ? 'new' : `${id}/edit`}`, 
                newUser ? {
                    ...user,
                    passwordConfirmation:user.password
                } : user).then((response) => {
            if(response.data.success) {
                setChanged({})
                setError({});
                if (newUser) {
                    history.replace(`/admin/users/${response.data.user.id}/view`)
                }
            }

            if (response.data.user) {
                setUser(response.data.user)
            }
        }).catch((error) => {
            if (error.response.data.errors)
                setError(error.response.data.errors);            
        })
    }



    if (!user)
        return <Container><Loader active inline='centered' /></Container>

    return(
        <Container className="edit-user">
            <Segment clearing vertical>            
                <Header floated='left' >User Info</Header>
                {Object.keys(changed).length > 0 &&
                Object.keys(changed).reduce((acc, current) => 
                    acc || changed[current], false) ?
                    <Button labelPosition='left'
                        floated='right'
                        icon
                        onClick={saveAll}
                        secondary
                        size='small'>
                        <Icon name='save' />
                        Save User
                    </Button> : 
                    <Button labelPosition='left'
                            floated='right'
                            icon
                            disabled
                            primary
                            size='small'>
                            <Icon name='save' />
                            Saved
                    </Button> }
            </Segment>              
            <Table definition>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>First Name</Table.Cell>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="First Name"
                                            type="text"           
                                            name='first_name'               
                                            error={ error && error.first_name && 
                                                { content: error.first_name.join(' & '),
                                                pointing:'left' }}
                                            icon={ changed?.first_name && { 
                                                name: 'save', 
                                                circular: true, 
                                                link:true,
                                                onClick: e => saveField('first_name',user.first_name)
                                            }}                      
                                            onChange={handleChange}
                                            value={user.first_name} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Last Name</Table.Cell>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Last Name"
                                            name='last_name'
                                            type="text"
                                            error={ error && error.last_name && 
                                                { content: error.last_name.join(' & '),
                                                pointing:'left' }}
                                            icon={ changed?.last_name ? { 
                                                name: 'save', 
                                                circular: true, 
                                                link:true,
                                                onClick: e => saveField('last_name',user.last_name)
                                            } : null}
                                            onChange={handleChange}
                                            value={user.last_name} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>User Type</Table.Cell>
                        <Table.Cell verticalAlign='middle'>
                            
                            <Form.Select                                         
                                placeholder="User Type"     
                                className="table_select"
                                value={user.type}
                                error={ error && error.type && 
                                    { content: error.type.join(' & '),
                                    pointing:'left' }}
                                name="type"                                  
                                onChange={handleChange}
                                options={user_types}/>
                    
                            {changed?.type && 
                                <Icon                                         
                                    name= 'save'
                                    className='select_icon'
                                    circular={true}                                             
                                    link={true}
                                    onClick={ e => saveField('type',user.type)} />
                                }                                                                    
                            
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>User Status</Table.Cell>
                        <Table.Cell verticalAlign='middle'>
                            
                            <Form.Select                                         
                                placeholder="User Status"     
                                className="table_select"
                                value={user.status}
                                error={ error && error.status && 
                                    { content: error.status.join(' & '),
                                    pointing:'left' }}
                                name="status"                                  
                                onChange={handleChange}
                                options={user_statuses}/>

                    
                            {changed?.status && 
                                <Icon                                         
                                    name= 'save'
                                    className='select_icon'
                                    circular={true}                                             
                                    link={true}
                                    onClick={ e => saveField('status',user.status)} />
                                } 

                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Email</Table.Cell>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Email"
                                            type="email"
                                            name='email'
                                            error={ error && error.email && 
                                                { content: error.email.join(' & '),
                                                pointing:'left' }}
                                            icon={ changed?.email ? { 
                                                name: 'save', 
                                                circular: true, 
                                                link:true,
                                                onClick: e => saveField('email',user.email)
                                            } : null}
                                            onChange={handleChange}
                                            value={user.email} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row>
                    { user.type !== 'admin' && <Table.Row>
                        <Table.Cell>Admin Email</Table.Cell>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Admin Email"
                                            name='admin_email'
                                            type="email"
                                            error={ error && error.admin_email && 
                                                { content: error.admin_email.join(' & '),
                                                pointing:'left' }}
                                            onChange={handleChange}
                                            icon={ changed?.admin_email ? { 
                                                name: 'save', 
                                                circular: true, 
                                                link:true,
                                                onClick: e => saveField('admin_email',user.admin_email)
                                            } : null}
                                            value={user.admin_email} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row>}
                    { newUser ? <Table.Row>
                        <Table.Cell>Password</Table.Cell>    
                        <Table.Cell>
                        <Form.Field>
                            <Form.Input placeholder="A secure password"
                                            name='password'
                                            type="password"
                                            error={ error && error.password && 
                                                { content: error.password.join(' & '),
                                                pointing:'left' }}
                                            onChange={handleChange}
                                            icon={ changed?.password ? { 
                                                name: 'save', 
                                                circular: true, 
                                                link:true,
                                                onClick: e => saveField('password',user.password)
                                            } : null}
                                            value={user.password} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row> :
                    <Table.Row>
                        <Table.Cell>ID</Table.Cell>
                        <Table.Cell>{user.id}</Table.Cell>
                    </Table.Row>}
                    
                </Table.Body>
            </Table>
            
            { !newUser && user.type === "researcher" && <>
            <Segment clearing vertical>            
                <Header floated='left' >Degrees</Header>
                { newDegree ? 
                <>
                <Button floated='right'
                        icon
                        labelPosition='left'
                        onClick={ e => addDegree()}
                        primary>
                    <Icon name='save' />
                    Save Degree
                </Button>
                <Button floated='right'
                        icon
                        labelPosition='left'
                        onClick={ e => setNewDegree(false)}
                        primary>
                    <Icon name='delete' />
                    Cancel
                </Button>
                </>
                :
                <Button floated='right'
                        icon
                        labelPosition='left'
                        onClick={ e => setNewDegree(true)}
                        primary>
                    <Icon name='plus' />
                    Add Degree
                </Button>}
            </Segment>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Intitution</Table.HeaderCell>
                        <Table.HeaderCell>Received</Table.HeaderCell>
                        <Table.HeaderCell>Remove Degree</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { newDegree && <Table.Row>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Title"
                                            type="text"
                                            name='title'
                                            error={ degreeError && degreeError.title && 
                                                { content: degreeError.title.join(' & '),
                                                pointing:'left' }}
                                            onChange={handleDegreeChange}
                                            value={degree.title} />
                            </Form.Field>
                        </Table.Cell>    
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Institution"
                                            type="text"
                                            name='institution'
                                            error={ degreeError && degreeError.institution && 
                                                { content: degreeError.institution.join(' & '),
                                                pointing:'left' }}
                                            onChange={handleDegreeChange}
                                            value={degree.institution} />
                            </Form.Field>
                        </Table.Cell>    
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Date Received"
                                            type="date"
                                            name='received'
                                            error={ degreeError && degreeError.received && 
                                                { content: degreeError.received.join(' & '),
                                                pointing:'left' }}
                                            onChange={handleDegreeChange}
                                            value={degree.received} />
                            </Form.Field>
                        </Table.Cell>    
                    </Table.Row>}
                    { degrees.map(degree => <Table.Row key={degree.id}>
                        <Table.Cell>{degree.title}</Table.Cell>
                        <Table.Cell>{degree.institution}</Table.Cell>
                        <Table.Cell>{degree.received}</Table.Cell>
                        <Table.Cell>
                            <Button color='red'
                                    onClick={e => removeDegree(degree.id)}
                                    icon='remove'/>
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
            </>}
        </Container>
    );
}

export default EditUser;