import { useState, useEffect } from "react";
import API from '../../../../utils/API';
import { Table, Button, Icon, Modal, Header, Container, Segment, Embed} from "semantic-ui-react";
import { Link} from "react-router-dom";

//import './index.css';

const PapersList = () => {

    // create variables
    const [fetch, setFetch] = useState(true);
    const [papers, setPapers] = useState([]);
    const [paper, setPaper] = useState(null);
    const [viewPaper, setViewPaper] = useState(false);

    // fetch all papers 
    useEffect(() => {
        if (fetch) {
            setFetch(false);
            API.get(`/api/paper/all`).then(response => {
                if (response.data.papers)
                    setPapers(response.data.papers);
            }).catch(error => {
                console.log(error);
            })
        }
    }, [fetch]);

    // return 
    return (
        <Container className="papers-list">
            <Header floated='left'>View Papers</Header>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Paper Id</Table.HeaderCell>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Researcher Name</Table.HeaderCell>
                        <Table.HeaderCell>Researcher Email</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {papers.map(paper => <Table.Row key={paper.id} >
                            <Table.Cell>{paper.id}</Table.Cell>
                            <Table.Cell>{paper.title}</Table.Cell>
                            <Table.Cell>{paper.status}</Table.Cell>
                            <Table.Cell>{paper.researcher}</Table.Cell>
                            <Table.Cell>{paper.researcher_email}</Table.Cell>
                            <Table.Cell textAlign='center'>
                                <Button secondary
                                    icon
                                    onClick={e => {
                                        setPaper(paper)
                                        setViewPaper(true);
                                    }}
                                    labelPosition='center'>
                                    <Icon name="file alternate" />
                                    {paper.file_path}
                                </Button>
                                <Button primary animated='vertical'
                                        to={`/editor/papers/${paper.id}/details`}
                                        as={Link}>
                                    <Button.Content hidden>View</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='eye' />
                                    </Button.Content>
                                </Button>
                                <Button tertiary animated='vertical'
                                        to={`/editor/papers/${paper.id}/edit`}
                                        as={Link}>
                                    <Button.Content hidden>Edit</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='pencil' />
                                    </Button.Content>
                                </Button>
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
};

export default PapersList;