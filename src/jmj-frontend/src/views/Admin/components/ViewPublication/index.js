import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import API from '../../../../utils/API';
import { Container, Header, Loader, Table, Icon, Button, Segment, Modal, Embed } from 'semantic-ui-react';
import { Link } from "react-router-dom";

import { useSelector } from 'react-redux';
import { selectUser } from '../../../../store/selectors/user';

import './index.css'

const ViewPublication = () => {

    let { id } = useParams();

    const user = useSelector(selectUser);

    const [fetch, setFetch] = useState(true);
    const [journal, setJournal] = useState(null);

    const [viewPaper, setViewPaper] = useState(false);
    const [paper, setPaper] = useState(null);

    useEffect(() => {
        if (fetch) {
            setFetch(false);
            API.get(`/api/journals/${id}`).then((response) => {
                if (response.data.journal)
                    setJournal(response.data.journal);
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetch, id]);

    if (!journal)
        return <Container><Loader active inline='centered' /></Container>

    return (
        <Container className="view-user">
            <Header dividing>Journal Info</Header>
            <Table definition>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>
                            {(user.type === 'admin' || user.type === 'editor') &&
                                <Button labelPosition='left'
                                    floated='right'
                                    icon
                                    secondary
                                    to={`/${user.type}/publications/${id}/edit`}
                                    as={Link}
                                    size='small'>
                                    <Icon name='pencil' />
                                    Edit Publication
                                </Button>}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Title</Table.Cell>
                        <Table.Cell>{journal.title}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Published Date</Table.Cell>
                        <Table.Cell>{journal.published_date}</Table.Cell>
                    </Table.Row>
                    {(user.type === 'admin' || user.type === 'editor') &&
                        <Table.Row>
                            <Table.Cell>Status</Table.Cell>
                            <Table.Cell>{journal.status}</Table.Cell>
                        </Table.Row>}
                    <Table.Row>
                        <Table.Cell>Editor</Table.Cell>
                        <Table.Cell>{journal.editor}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Editor Email</Table.Cell>
                        <Table.Cell>{journal.editor_email}</Table.Cell>
                    </Table.Row>
                    {(user.type === 'admin' || user.type === 'editor') && <>
                        <Table.Row>
                            <Table.Cell>Admin</Table.Cell>
                            <Table.Cell>{journal.admin}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Admin Email</Table.Cell>
                            <Table.Cell>{journal.admin_email}</Table.Cell>
                        </Table.Row>
                    </>}
                </Table.Body>
            </Table>

            { journal.papers && <>
                <Segment clearing vertical>
                    <Header floated='left' >Papers</Header>
                </Segment>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Researcher</Table.HeaderCell>
                            {(user.type === 'admin' || user.type === 'editor') && <>
                                <Table.HeaderCell>Editor</Table.HeaderCell>
                                <Table.HeaderCell>Metric Used</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell></>}
                            <Table.HeaderCell>File</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {journal.papers.map(paper => <Table.Row key={paper.id}>
                            <Table.Cell>{paper.title}</Table.Cell>
                            <Table.Cell>{paper.researcher}</Table.Cell>
                            {(user.type === 'admin' || user.type === 'editor') && <>
                                <Table.Cell>{paper.editor}</Table.Cell>
                                <Table.Cell>{paper.em_name}</Table.Cell>
                                <Table.Cell>{paper.status}</Table.Cell> </>}
                            <Table.Cell>
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
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </>}

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
                            {paper?.title}
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

export default ViewPublication;