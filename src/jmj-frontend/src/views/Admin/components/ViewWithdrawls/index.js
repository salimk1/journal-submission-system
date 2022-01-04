import React, { useState, useEffect } from 'react';
import API from '../../../../utils/API';
import { Container, Header, Loader, Table, Icon, Button, Segment, Modal, Embed, Message } from 'semantic-ui-react';

import './index.css'

const ViewWithdrawls = () => {


    const [fetchPapers, setFetchPapers] = useState(true);
    const [papers, setPapers] = useState(null);

    const [viewPaper, setViewPaper] = useState(false);
    const [paper, setPaper] = useState(null);

    useEffect(() => {
        if (fetchPapers) {
            setFetchPapers(false);
            API.get('/api/paper/withdrawn').then((response) => {
                if (response.data.papers) {
                    setPapers(response.data.papers);
                }
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetchPapers])

    const withdrawPaper = (id, approved = true) => {
        API.post(`/api/paper/${id}/withdraw`, {
            approved: approved
        }).then((response) => {
            if (response.data.success) {
                if (approved)
                    setPapers(papers.filter(paper => paper.id !== id));
                else
                    setPapers(papers.map(paper => paper.id === id ? {
                        ...paper,
                        withdrawal_status: 'rejected'
                    } : paper));
            }
        }).catch((error) => {

        })
    }

    if (!papers)
        return <Container><Loader active inline='centered' /></Container>

    return (
        <Container className="edit-publication">
            <Header dividing>Paper withrawal requests</Header>
            { papers && papers.length > 0 ?
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Researcher</Table.HeaderCell>
                        <Table.HeaderCell>File</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {papers.map(paper =>
                        <Table.Row key={paper.id}>
                            <Table.Cell>{paper.title}</Table.Cell>
                            <Table.Cell>{paper.researcher_email}</Table.Cell>
                            <Table.Cell>
                                <Button secondary
                                    icon
                                    onClick={e => {
                                        setPaper(paper)
                                        setViewPaper(true);
                                    }}
                                    labelPosition='left'>
                                    <Icon name="file alternate" />
                                    {paper.file_path}
                                </Button>
                            </Table.Cell>
                            <Table.Cell>{paper.status}</Table.Cell>
                            <Table.Cell>
                                {paper.withdrawal_status === 'rejected' ?
                                    <Button icon
                                        color='red'
                                        disabled
                                        labelPosition='left'>
                                        <Icon name="remove" />
                                Rejected
                            </Button>
                                    :
                                    <Button icon
                                        color='red'
                                        onClick={() => withdrawPaper(paper.id, false)}
                                        labelPosition='left'>
                                        <Icon name="remove" />
                                Reject
                            </Button>}
                                <Button icon
                                    onClick={() => withdrawPaper(paper.id)}
                                    color='blue'
                                    labelPosition='left'>
                                    <Icon name="check" />
                                Approve
                            </Button>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table> : <Message>There are no withdrawal requests</Message>}

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
                        url={`http://localhost/storage/${paper?.file_path}`} />
                </Modal.Content>
            </Modal>


        </Container>
    );
}

export default ViewWithdrawls;