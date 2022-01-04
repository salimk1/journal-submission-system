import { useState, useEffect } from "react";
import {Container, Header, Button, Segment, Icon, Table, Divider, Modal, 
    Embed, Loader, Card, Form} from 'semantic-ui-react'
import {useParams} from 'react-router-dom'
import API from "../../../../utils/API";
import PaperStatus from "../../../../components/PaperStatus"

const EditPaper = () => {
    // varaibles
    let { id } = useParams();       // get id of current paper

    const [fetchPaper, setFetchPaper] = useState(true);         // initially fetch paper
    const [paper, setPaper] = useState(null);
    const [nominated, setNominated] = useState(null);                       // store nominated
    const [deleteRevDetails, setDeleteRevDetails] = useState(null);         // store rev to delete details
    const [assigned, setAssigned] = useState(null);                         // store assigned

    const [viewPaper, setViewPaper] = useState(false);                  // view paper pdf
    const [reviewers, setReviewers] = useState(null);

    const [removeNomi, setRemoveNomi] = useState(false);            // remove nominated rev
    const [removeAssigned, setRemoveAssigned] = useState(false);    // remove assigned rev
    const [action, setAction] = useState(null);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [evaluationMetric, setEvaluationMetric] = useState(null);
    const [withdrawn, setWithdrawn] = useState(false);
    const [error, setError] = useState({});
    const [changed, setChanged] = useState({});
    const [fetchReviewers, setFetchReviewers] = useState(false);
    const [nominateReviewer, setNominateReviewer] = useState(false);
    const [reviewer, setReviewer] = useState(null);

    // fetch paper
    useEffect(() => {
        if (fetchPaper) {
            setFetchPaper(false);
            API.get(`/api/paper/${id}`).then(response => {
                if (response.data.paper)
                    setPaper(response.data.paper);
                if (response.data.nominated)
                    setNominated(response.data.nominated.map(nominee => 
                        response.data.assigned.find(assinee => assinee.reviewer_id===nominee.reviewer_id) ? ({
                            ...nominee,
                            assigned: true
                        }):nominee));
                if (response.data.assigned)
                    setAssigned(response.data.assigned);
                if (response.data.withdraw)
                    setWithdrawn(response.data.withdraw);
                if (response.data.evaluation_metric)
                    setEvaluationMetric(response.data.evaluation_metric)
                setFetchReviewers(true);
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetchPaper, id])

    useEffect(() => {
        if ( fetchReviewers) {
            setFetchReviewers(false);
            API.get(`/api/users/of_type/reviewer`).then(response => {
                if (response.data.users) {
                    setReviewers(response.data.users
                        .filter(user => assigned.find(nominee => nominee.reviewer_email === user.email) === undefined)
                        .filter(user => nominated.find(nominee => nominee.reviewer_email === user.email) === undefined)
                        .map(user => ({
                            key: user.email,
                            text: user.first_name + ' ' + user.last_name,
                            value: user.email
                        })))
                }
            }).catch(error => {

            })
        }
    }, [assigned, fetchReviewers, id, nominated])

    // remove nominated/assigned reviewer
    const removeRev = (deleteRev) => {
        if(removeNomi) {
            // remove nomi
            API.post(`/api/nominated/remove`, {
                paper_id: deleteRev.paper_id,
                reviewer_email: deleteRev.email
            }).then(response => {
                if (response.data.success) {
                    setFetchPaper(true);
                    setRemoveNomi(false);
                }
            }).catch((error => {
                console.error(error.response);
            }))

        } else if (removeAssigned) {
            // remove assigned
            API.post(`/api/assigned/remove`, {
                paper_id: deleteRev.paper_id,
                reviewer_email: deleteRev.email
            }).then(response => {
                if (response.data.success) {
                    setFetchPaper(true);
                    setRemoveAssigned(false);
                }
            }).catch((error => {
                console.error(error.response);
            }))
            
        } 
    }

    // approve nominated reviewer
    const approveNomiRevMethod = (approveNomiRev) => {
        // add to assign
        API.post('/api/assigned/new', {
            paper_id: approveNomiRev.paper_id,
            researcher_email: approveNomiRev.researcher_email,
            reviewer_email: approveNomiRev.reviewer_email,
            revision_deadline: approveNomiRev.revision_deadline,
        }).then(respomse => {
            if (respomse.data.success) {               
                setFetchPaper(true);
            }
        }).catch((error => {
            console.error(error.response);
        }))
    }

    const handleChange = (e, { name, value }) => {
        setPaper({
            ...paper,
            [name]: value
        });


        setChanged({
            ...changed,
            [name]: value
        })
    }

    const saveField = (name, value) => {
        API.post(`/api/paper/${id}/edit`,{
            [name]:value
        }).then(response => {
            if (response.data.success)
                setChanged({
                    ...changed,
                    [name]: false
                });
                setPaper({
                    ...paper,
                    [name]:value
                });
        }).catch(err => {

        })
    }

    const newNominatedReviewer = () => {
        API.post(`/api/assigned/new`, 
        {
            paper_id: paper.id,
            researcher_email: paper.researcher_email,
            reviewer_email: reviewer,
            revision_deadline: '2021-05-23',
        }).then(response => {
            if (response.data.success) {
                setReviewer(null);
                setNominateReviewer(false);
                if (response.data.assigned) {
                    setAssigned([...assigned, response.data.assigned]);
                    console.log(reviewers)
                    console.log(response.data.nominated)
                    setReviewers(reviewers.filter(reviewer => reviewer.key !== response.data.assigned.reviewer_email))
                }
            }
        }).catch((error => {
            console.error(error.response);
        }))
    }

    const handleReviewerChange = (e, { name, value }) => {
        setReviewer(value);
    }

    // return 
    if (!paper) {
        return (
            <Container>
                <Loader />
            </Container>
        )
    }

    return (
        <Container>
            <Segment clearing vertical>
                <Header floated='left' >Edit Paper</Header>
            </Segment>
            <Table definition>
                <Table.Body> 
                    <Table.Row>
                        <Table.Cell>Title</Table.Cell>
                        <Table.Cell>
                            <Form.Field>
                                <Form.Input placeholder="Title"
                                    name="title"
                                    value={paper.title}
                                    onChange={handleChange}
                                    error={error && error.title &&
                                    {
                                        content: error.title.join(' & '),
                                        pointing: 'left'
                                    }}
                                    icon={ changed?.title && {
                                        name: 'save',
                                        circular: true,
                                        link: true,
                                        onClick: e => saveField('title', paper.title)
                                    }} />
                            </Form.Field>
                            </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Status</Table.Cell>
                        <Table.Cell>
                            <PaperStatus status={paper.status}
                                        edit={(status) => saveField('status', status)} />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Researcher</Table.Cell>
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
                        <Table.HeaderCell textAlign='center'>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {nominated && nominated.map(nomi => 
                        <Table.Row key={nomi.id}>
                            <Table.Cell>{nomi.reviewer}</Table.Cell>
                            <Table.Cell>{nomi.reviewer_email}</Table.Cell>
                            <Table.Cell textAlign='center'>
                                {!nomi.assigned && <> 
                                <Button color='green' animated='vertical'
                                        onClick={(e) => {
                                            approveNomiRevMethod({
                                                paper_id: paper.id,
                                                researcher_email: paper.researcher_email,
                                                reviewer_email: nomi.reviewer_email,
                                                revision_deadline: '2021-01-02'
                                            });
                                        }}>
                                    <Button.Content hidden>Add</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='checkmark' />
                                    </Button.Content>
                                </Button>
                                <Button color='red' animated='vertical'
                                        onClick={(e) => {
                                            setDeleteRevDetails({
                                                name: nomi.reviewer,
                                                email: nomi.reviewer_email,
                                                paper_id: paper.id,
                                                user_id: nomi.id
                                            });
                                            setRemoveNomi(true);
                                            setAction({
                                                action: 'Are you sure you want to reject the nominated reviewer:'
                                            });
                                            setOpenConfirmation(true);
                                        }}>
                                    <Button.Content hidden>Remove</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='x' />
                                    </Button.Content>
                                </Button> 
                                </>}                                    
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
            <Divider />
            <Segment clearing vertical>
                <Header floated='left' >Assigned Reviewers</Header>
                {nominateReviewer ?
                        <Button floated='right'
                            icon
                            color='green'
                            onClick={e => newNominatedReviewer()}
                            labelPosition='left'
                            size='small'>
                            <Icon name='save' />
                    Assign this reviewer
                </Button>
                        :

                        <Button floated='right'
                            icon
                            primary
                            onClick={e => setNominateReviewer(true)}
                            labelPosition='left'
                            size='small'>
                            <Icon name='plus' />
                    Assign Reviewer
                </Button>}
            </Segment>
            <Table celled >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Email</Table.HeaderCell>
                        <Table.HeaderCell textAlign='center'>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {nominateReviewer && <Table.Row>
                        <Table.Cell>
                            <Form.Select placeholder="Reviewer"
                                name="reviewer"
                                search
                                value={reviewer}
                                onChange={handleReviewerChange}
                                options={reviewers} />
                        </Table.Cell>
                        <Table.Cell>
                            {reviewer && reviewer}
                        </Table.Cell>
                    </Table.Row>}
                    {assigned && assigned.map(assign => 
                        <Table.Row key={assign.id}>
                            <Table.Cell>{assign.reviewer}</Table.Cell>
                            <Table.Cell>{assign.reviewer_email}</Table.Cell>
                            <Table.Cell textAlign='center'>
                                <Button color='red' animated='vertical'
                                        onClick={(e) => {
                                            setDeleteRevDetails({
                                                name: assign.reviewer,
                                                email: assign.reviewer_email,
                                                user_id: assign.id,
                                                paper_id: paper.id
                                            });
                                            setRemoveAssigned(true);
                                            setAction({
                                                action: 'Are you sure you want to remove the assigned reviewer:'
                                            })
                                            setOpenConfirmation(true);
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
            <Modal
                basic
                onClose={() => setOpenConfirmation(false)}
                onOpen={() => setOpenConfirmation(true)}
                open={openConfirmation}
                dimmer='blurring'
                size='small'>
                <Header icon textAlign='center'>
                    <Icon name='book' />
                   {action?.action} {deleteRevDetails?.name}
                </Header>
                <Modal.Content>
                    <Container textAlign='center'>
                    <p className="align center">
                        This will remove the reviewer from the paper.
                    </p>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' inverted onClick={() => setOpenConfirmation(false)}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='red' inverted onClick={() => {
                        removeRev(deleteRevDetails);
                        setOpenConfirmation(false);
                    }}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal> 
        </Container>
    );
}

export default EditPaper;