import React, { useState, useEffect } from 'react';
import { 
    Container,
    Header,
    Button,
    Segment,
    Icon,
    Loader,
    Table,
    Embed,
    Modal
 } from 'semantic-ui-react';

 import { 
     Link
 } from 'react-router-dom'

 import { useSelector } from 'react-redux';
 import { selectUser } from '../../../../store/selectors/user'

import API from '../../../../utils/API';

const ViewPapers = () => {

    const user = useSelector(selectUser);

    const [ fetchPapers, setFetchPapers ] = useState(true);
    const [ papers, setPapers] = useState(null)
    
    const [ viewPaper, setViewPaper ] = useState(false);
    const [ paper, setPaper ] = useState(null);

    useEffect(() => {
        if (fetchPapers) {
            setFetchPapers(false);
            API.get(`/api/paper/all`).then(response => {
                if (response.data.papers)
                    setPapers(response.data.papers)

            }).catch(err => {
                console.error(err)
            })
        }
    }, [fetchPapers])

    if (!papers) 
        return (
            <Container className="view-papers">
                <Loader />
            </Container>
        )
    return (
        <Container className='view-papers'>
            <Segment clearing vertical>
                <Header floated='left'>
                    My Papers { user.type === 'reviewer' && 'to review'}
                </Header>
                { user.type === 'researcher' && 
                <Button floated='right'
                        primary 
                        as={Link}
                        to='/researcher/papers/new/edit'
                        icon    
                        labelPosition='left'>
                    <Icon name='plus' />
                    Submit a paper
                </Button> }
            </Segment>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        { user.type === 'reviewer' ? <>
                        <Table.HeaderCell>Minor Review Deadline</Table.HeaderCell> 
                        <Table.HeaderCell>Major Review Deadline</Table.HeaderCell> </>: 
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        }
                        <Table.HeaderCell>File</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { papers.map(paper => 
                        <Table.Row key={paper.id}>
                            <Table.Cell>{paper.title}</Table.Cell>
                            { user.type === 'reviewer' ? <>
                            <Table.Cell>{paper.minor_rev_deadline}</Table.Cell>
                            <Table.Cell>{paper.major_rev_deadline}</Table.Cell>
                            </>:
                            <Table.Cell>{paper.status}</Table.Cell>}
                            <Table.Cell textAlign="center">
                                <Button secondary
                                    icon
                                    onClick={e => {
                                        setPaper(paper)
                                        setViewPaper(true);
                                    }}
                                    labelPosition='left'>
                                    <Icon name="file alternate" />
                                    View File
                                </Button>  
                            </Table.Cell>
                            <Table.Cell textAlign='center'>
                                <Button primary 
                                        as={Link}
                                        to={`/${user.type}/papers/${paper.id}/view`}
                                        icon>
                                    <Icon name='eye' />
                                </Button>
                                { user.type === 'researcher' && 
                                <Button secondary
                                        as={Link}
                                        to={`/researcher/papers/${paper.id}/edit`}
                                        icon>
                                    <Icon name='pencil' />
                                </Button>}
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <Modal
                dimmer='inverted'
                onClose={() => setViewPaper(false)}
                onOpen={() => setViewPaper(true)}
                open={viewPaper}
                size='fullscreen'>
                <Segment clearing vertical padded>
                    <Container className='file-view-header'>
                    <Button primary 
                            floated='right'
                            onClick={(e) => {
                                setViewPaper(false);
                                setPaper(null);
                        }}>
                            <Icon name='check' /> Done
                        </Button>
                        <Header textAlign='center'
                                floated='left'>
                            { paper?.title }
                            <Header.Subheader>
                                {paper?.researcher_email}
                            </Header.Subheader>
                        </Header>
                    </Container>
                </Segment>
                <Modal.Content>       
                    <Embed
                        defaultActive
                        icon='right circle arrow'
                        placeholder='/images/image-16by9.png'
                        url={`http://localhost/storage/${paper?.file_path}`}
                    />                    
                </Modal.Content>
            </Modal>
        </Container>
    );
}

export default ViewPapers