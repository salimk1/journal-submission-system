import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import API from '../../../../utils/API';
import { Container, Header, Loader, Table, Icon, Button, } from 'semantic-ui-react';
import { Link } from "react-router-dom";
const ViewUser = () => {

    let { id } = useParams();

    const [fetch, setFetch ] = useState(true);
    const [fetchDegrees, setFetchDegrees ] = useState(false);
    const [ user, setUser ] = useState(null);
    const [ degrees, setDegrees ] = useState([]);
    
    useEffect(() => {
        if(fetch){
            setFetch(false);
            API.get(`/api/users/${id}`).then((response) => {
                if (response.data.user) {
                    setUser(response.data.user);

                    if (response.data.user.type === 'researcher')
                        setFetchDegrees(true);
                }

            }).catch((error) => {
                console.error(error);
            })
        }
    },[fetch, id]);

    useEffect(() => {
        if (fetchDegrees && user?.type === 'researcher') {
            setFetchDegrees(false);
            API.get(`/api/users/${id}/degrees`).then((response => {
                if (response.data.degrees)
                    setDegrees(response.data.degrees);
            })).catch((err) => {

            })
        }

    }, [user, fetchDegrees, id]);

    if (!user)
        return <Container><Loader active inline='centered' /></Container>

    return(
        <Container className="view-user">
            <Header dividing>User Info</Header>
                <Table definition>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell />
                            <Table.HeaderCell>
                                <Button labelPosition='left'
                                    floated='right'
                                    icon
                                    secondary
                                    to={`/admin/users/${id}/edit`}
                                    as={Link}
                                    size='small'>
                                    <Icon name='pencil' />
                                    Edit User
                                </Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    <Table.Row>
                            <Table.Cell>First Name</Table.Cell>
                            <Table.Cell>{user.first_name}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Last Name</Table.Cell>
                            <Table.Cell>{user.last_name}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>User Type</Table.Cell>
                            <Table.Cell>{user.type}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Status</Table.Cell>
                            <Table.Cell>{user.status}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Email</Table.Cell>
                            <Table.Cell>{user.email}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>ID</Table.Cell>
                            <Table.Cell>{user.id}</Table.Cell>
                        </Table.Row>
                        { user.admin_email && <Table.Row>
                            <Table.Cell>Admin Email</Table.Cell>
                            <Table.Cell>{user.admin_email}</Table.Cell>
                        </Table.Row>}
                    </Table.Body>
                </Table>
                
            { user.type === "researcher" && <>
            <Header dividing>Degrees</Header>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Intitution</Table.HeaderCell>
                        <Table.HeaderCell>Received</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { degrees.map(degree => <Table.Row>
                        <Table.Cell>{degree.title}</Table.Cell>
                        <Table.Cell>{degree.institution}</Table.Cell>
                        <Table.Cell>{degree.received}</Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
            </>}
        </Container>
    );
}

export default ViewUser;