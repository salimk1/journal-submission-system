import { useState, useEffect } from "react";
import API from '../../../../utils/API';
import { Table, Button, Icon, Modal, Header, Container, Segment, 
    Embed, Loader, Divider, Card} from "semantic-ui-react";
import { Link, useParams} from "react-router-dom";
import PaperStatus from "../../../../components/PaperStatus";

//import './index.css';

const PaperDetails = () => {

    // create variables
    const [fetch, setFetch] = useState(true);
    const [paper, setPaper] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [nominated, setNominated] = useState([]);
    const [ viewPaper, setViewPaper ] = useState(false);
    const [evaluationMetric, setEvaluationMetric] = useState(null);
    const [withdrawn, setWithdrawn] = useState(false);
    let {id} = useParams(); 

    // fetch all papers 
    useEffect(() => {
        if (fetch) {
            setFetch(false);
            API.get(`/api/paper/${id}`).then(response => {
                if (response.data.paper)
                    setPaper(response.data.paper);
                if (response.data.nominated)
                    setNominated(response.data.nominated);
                if (response.data.assigned)
                    setAssigned(response.data.assigned);
            }).catch(error => {
                console.log(error);
            })
        }
    }, [fetch, id]);

    // return 
    if (!paper) 
        return (
            <Container><Loader active inline='centered' /></Container>
        )
    return (
        <Container className="paper-details">
            <Segment clearing vertical>
                <Header floated='left' >Paper Info</Header>
                <Button floated='right'
                        icon
                        secondary
                        to={`/editor/papers/${id}/edit`}
                        as={Link}
                        labelPosition='left'
                        size='small'>
                    <Icon name='plus' />
                    Edit Paper
                </Button>
            </Segment>
            <Table definition>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Paper Id</Table.Cell>
                        <Table.Cell>{paper.id}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Title</Table.Cell>
                        <Table.Cell>{paper.title}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Status</Table.Cell>
                        <Table.Cell>
                            <PaperStatus status={paper.status} />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Researcher Name</Table.Cell>
                        <Table.Cell>{paper.researcher}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Researcher Email</Table.Cell>
                        <Table.Cell>{paper.researcher_email}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>File</Table.Cell>
                        <Table.Cell>
                            <Button secondary
                                    icon
                                    onClick={e => {
                                        setViewPaper(true);
                                    }}
                                    labelPosition='left'>
                                <Icon name="file alternate" />
                                View File
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <Divider />
            <Segment clearing vertical>
                <Header>Evaluation Metric: {evaluationMetric?.name}</Header>
            </Segment>
            <Divider hidden />
            <Card.Group>
                {evaluationMetric?.questions.map(metric =>
                    <Card>
                        <Card.Content>
                            <Card.Header>{metric.question}</Card.Header>
                            <Card.Meta>
                                <span>{metric.answer_type}</span>
                            </Card.Meta>

                        </Card.Content>
                    </Card>)}
            </Card.Group>
            <Divider />
            <Segment clearing vertical>
                <Header floated='left' >Nominated Reviewers</Header>
            </Segment>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {nominated && nominated.map(user => 
                        <Table.Row key={user.id}>
                            <Table.Cell>{user.reviewer}</Table.Cell>
                            <Table.Cell>{user.reviewer_email}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <Divider />
            <Segment clearing vertical>
                <Header floated='left' >Assigned Reviewers</Header>
            </Segment>
            <Table >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {assigned && assigned.map(user => 
                        <Table.Row key={user.id}>
                            <Table.Cell>{user.reviewer}</Table.Cell>
                            <Table.Cell>{user.reviewer_email}</Table.Cell>
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
};

export default PaperDetails;