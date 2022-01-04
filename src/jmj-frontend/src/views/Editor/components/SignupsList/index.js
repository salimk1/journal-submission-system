import { useState, useEffect } from "react";
import API from '../../../../utils/API';

import { Table, Button, Icon, Modal, Header, Container} from "semantic-ui-react";

const SignupsList = () => {
    // declare variables
    const [fetch, setFetch] = useState(true);
    const [ users, setUsers ] = useState([]);
    const [ open, setOpen ] = useState(false);
    const [ currentDelete, setCurrentDelete ] = useState(null);

    // fetch users method
    useEffect(() => {
        if(fetch) {
            setFetch(false);
            API.get('/api/users/signups').then(response => {
                if (response.data.users)
                    setUsers(response.data.users);
            }).catch(error => {
                console.log(error);
            })
        }
    },[fetch]);

    // 
    const addUser = id => {
        API.post(`/api/users/${id}/change_status`).then((response) => {
            if (response.data.success) {
                setUsers(users.filter(user => user.id !== id));
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    const removeUser = id => {
        API.post(`/api/users/${id}/remove`).then((response) => {
            if (response.data.success) {
                setCurrentDelete(null);
                setUsers(users.filter(user => user.id !== id));
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    return (
        <div className="signups-list">
            <Header floated='left'>View Signups</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Type</Table.HeaderCell>
                        <Table.HeaderCell>Satus</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                        <Table.HeaderCell>Admin Email</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                { users.map(user => 
                    <Table.Row key={user.id}>
                        <Table.Cell>{user.first_name + ' ' + user.last_name}</Table.Cell>
                        <Table.Cell>{user.type}</Table.Cell>
                        <Table.Cell>{user.status}</Table.Cell>
                        <Table.Cell>{user.email}</Table.Cell>
                        <Table.Cell>{user.admin_email}</Table.Cell>
                        <Table.Cell textAlign='center'>
                            <Button color='green' animated='vertical'
                                onClick={(e) => {
                                    addUser(user.id);
                                }}>
                                <Button.Content hidden>Add</Button.Content>
                                <Button.Content visible>
                                    <Icon name='checkmark' />
                                </Button.Content>
                            </Button>
                            <Button color='red' animated='vertical'
                                onClick={(e) => {
                                    setOpen(true);
                                    setCurrentDelete({
                                        firstname:user.first_name,
                                        last_name:user.last_name,
                                        id:user.id
                                    });
                                }}>
                                <Button.Content hidden>Remove</Button.Content>
                                <Button.Content visible>
                                    <Icon name='x' />
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
                    <Icon name='book' />
                    Remove user {currentDelete?.firstname + ' ' + currentDelete?.last_name}?
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
                        removeUser(currentDelete?.id)
                        setCurrentDelete(null);
                    }}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal> 
        </div>       
    );  
};

export default SignupsList;