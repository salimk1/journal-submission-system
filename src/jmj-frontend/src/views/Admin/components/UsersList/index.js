import React, { useState, useEffect } from "react";
import API from '../../../../utils/API';

import { Table, Button, Icon, Modal, Header, Container, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import './index.css'

const UserList = () => {

    const [fetch, setFetch] = useState(true);
    const [ users, setUsers ] = useState([]);
    const [ open, setOpen ] = useState(false);
    const [ currentDelete, setCurrentDelete ] = useState(null);

    useEffect(() => {
        if(fetch) {
            setFetch(false);
            API.get('/api/users/all').then(response => {
                if (response.data.users)
                    setUsers(response.data.users);
            }).catch(error => {
                console.log(error);
            })
        }
    },[fetch]);

    const removeUser = id => {
        API.post(`/api/users/${id}/remove`).then((response) => {
            if(response.data.success) {
                setUsers(users.filter(user => user.id !== id));
            }
        }).catch(err => {
            console.log(err);
        })
    }

    return (
        <Container className="users-list"> 
            <Segment clearing vertical>            
                <Header floated='left' >All Users</Header>
                <Button floated='right'
                        icon
                        labelPosition='left'
                        as={Link}
                        to='/admin/users/new/edit'
                        primary>
                    <Icon name='plus' />
                    Add User
                </Button>
            </Segment>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>User Type</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                { users.map(user => 
                    <Table.Row key={user.id}>
                        <Table.Cell>{user.first_name + ' ' + user.last_name}</Table.Cell>
                        <Table.Cell>{user.type}</Table.Cell>
                        <Table.Cell>{user.status}</Table.Cell>
                        <Table.Cell textAlign='center'>
                        <Button primary animated='vertical'
                                    to={`/admin/users/${user.id}/view`}
                                    as={Link}>
                                <Button.Content hidden>View</Button.Content>
                                <Button.Content visible>
                                    <Icon name='eye' />
                                </Button.Content>
                            </Button>
                            <Button secondary animated='vertical'
                                    to={`/admin/users/${user.id}/edit`}
                                    as={Link}>
                                <Button.Content hidden>Edit</Button.Content>
                                <Button.Content visible>
                                    <Icon name='pencil' />
                                </Button.Content>
                            </Button> 
                            <Button color='red' animated='vertical'
                                    onClick={(e) => {
                                        setOpen(true);
                                        setCurrentDelete({
                                            name:user.first_name + ' ' + user.last_name,
                                            id:user.id
                                        });
                                    }}>
                                <Button.Content hidden>Remove</Button.Content>
                                <Button.Content visible>
                                    <Icon name='delete' />
                                </Button.Content>
                            </Button>                                   
                        </Table.Cell>
                    </Table.Row>
                )}
                </Table.Body>
            </Table>
            <Modal
                basic
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                dimmer='blurring'
                size='small'>
                <Header icon textAlign='center'>
                    <Icon name='user' />
                    Remove user {currentDelete?.name}?
                </Header>
                <Modal.Content>
                    <Container textAlign='center'>
                    <p className="align center">
                        This will permanently remove the user and all of their related data.
                    </p>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' inverted onClick={() => setOpen(false)}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='red' inverted onClick={() => {
                        setOpen(false);
                        removeUser(currentDelete?.id);
                        setCurrentDelete(null);
                    }}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>                    
        </Container>
    )
}
export default UserList;