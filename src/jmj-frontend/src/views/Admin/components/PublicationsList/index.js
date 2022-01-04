import React, { useEffect, useState } from 'react';

import { 
    Container,
    Header,
    Loader,
    Table,
    Button,
    Icon,
    Modal,
    Segment
} from 'semantic-ui-react';

import { useSelector } from 'react-redux';
import { selectUser } from '../../../../store/selectors/user';

import { 
    Link
} from 'react-router-dom'

import API from '../../../../utils/API';

const PublicationsList = () => {

    const user = useSelector(selectUser);

    const [ fetchPublications, setFetchPublications ] = useState(true);
    const [ journals, setJournals ] = useState(null);
    const [ open, setOpen ] = useState(false);
    const [ currentDelete, setCurrentDelete ] = useState(null);

    const noEdit = user.type !== 'admin' && user.type !== 'editor';
    
    useEffect(() => {
        if(fetchPublications) {
            setFetchPublications(false);
            API.get('/api/journals/all').then((response) => {
                if (response.data.journals) 
                    setJournals(response.data.journals)
            }).catch((error) => {
                console.error(error);
            })
        }
    },[fetchPublications])

    const removeJournal = id => {
        API.post(`/api/journals/${id}/remove`).then((response) => {
            if (response.data.success) {
                setCurrentDelete(null);
                setJournals(journals.filter(journal => journal.id !== id));
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    if (!journals)
        return <Container><Loader /></Container>

    return(
    <Container>
        <Segment clearing vertical>
            <Header floated='left'>All Publications</Header>
            { ( user.type === 'admin' || user.type === 'editor' ) &&
            <Button primary
                    icon
                    labelPosition='left'
                    floated='right'
                    as={Link}
                    to={`/${user.type}/publications/new/edit`}>
                        <Icon name='plus' />
                        New Publication
            </Button> }
        </Segment>
        
        <Table celled>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell>Published Date</Table.HeaderCell>
                    { ( user.type === 'admin' || user.type === 'editor' ) &&
                    <Table.HeaderCell>Status</Table.HeaderCell> }
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                { journals.map(journal => 
                    <Table.Row key={journal.id}>
                        <Table.Cell>{journal.title}</Table.Cell>
                        <Table.Cell>{journal.published_date}</Table.Cell>
                        { ( user.type === 'admin' || user.type === 'editor' ) &&
                        <Table.Cell>{journal.status}</Table.Cell>}
                        <Table.Cell textAlign='center'>
                            <Button primary animated='vertical'
                                    to={`/${user.type}/publications/${journal.id}/view`}
                                    as={Link}>
                                <Button.Content hidden>View</Button.Content>
                                <Button.Content visible>
                                    <Icon name='eye' />
                                </Button.Content>
                            </Button>
                            { !noEdit && <>
                            <Button secondary animated='vertical'
                                    to={`/${user.type}/publications/${journal.id}/edit`}
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
                                            title:journal.title,
                                            id:journal.id
                                        });
                                    }}>
                                <Button.Content hidden>Remove</Button.Content>
                                <Button.Content visible>
                                    <Icon name='delete' />
                                </Button.Content>
                            </Button>  </> }              
                        </Table.Cell>
                    </Table.Row>)}
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
                    Remove journal {currentDelete?.title}?
                </Header>
                <Modal.Content>
                    <Container textAlign='center'>
                    <p className="align center">
                        This will permanently remove the journal and all of their related data.
                    </p>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' inverted onClick={() => setOpen(false)}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='red' inverted onClick={() => {
                        setOpen(false);
                        removeJournal(currentDelete?.id);
                        setCurrentDelete(null);
                    }}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>           
    </Container>
    );
}

export default PublicationsList;