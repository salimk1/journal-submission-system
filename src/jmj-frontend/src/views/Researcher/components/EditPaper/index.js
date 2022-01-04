import React, { useState, useEffect } from "react";

import {
    Container,
    Header,
    Button,
    Segment,
    Icon,
    Table,
    Loader,
    Divider,
    Form,
    Modal,
    Embed,
    Message,
    Card
} from 'semantic-ui-react'

import {
    useParams,
    useHistory
} from 'react-router-dom'
import API from "../../../../utils/API";
import PaperStatus from "../../../../components/PaperStatus";

const EditPaper = () => {
    let { id } = useParams();
    let history = useHistory();

    const [fetchPaper, setFetchPaper] = useState(true);
    const [paper, setPaper] = useState({
        id: "",
        title: "",
        status: "",
        file_path: "",
        researcher_email: "",
        editor_email: "",
        em_name: ""
    });

    const [error, setError] = useState({});
    const [changed, setChanged] = useState({});

    const [viewPaper, setViewPaper] = useState(false);

    const [editPaperFile, setEditPaperFile] = useState(false);
    const [newFile, setNewFile] = useState(null);

    const [nominateReviewer, setNominateReviewer] = useState(false);

    const [reviewer, setReviewer] = useState(null);

    const [nominated, setNominated] = useState(null);
    const [assigned, setAssigned] = useState(null);
    const [withdrawn, setWithdrawn] = useState(false);

    const [reviewers, setReviewers] = useState(null);
    const [fetchReviewers, setFetchReviewers] = useState(false);

    const [evaluationMetric, setEvaluationMetric] = useState(null);

    const newPaper = id === 'new'

    useEffect(() => {
        if (!newPaper && fetchPaper) {
            setFetchPaper(false);
            API.get(`/api/paper/${id}`).then(response => {
                if (response.data.paper) {
                    setPaper(response.data.paper);
                }

                if (response.data.nominated)
                    setNominated(response.data.nominated);

                if (response.data.assigned)
                    setAssigned(response.data.assigned);

                if (response.data.withdraw)
                    setWithdrawn(response.data.withdraw);

                if (response.data.evaluation_metric)
                    setEvaluationMetric(response.data.evaluation_metric)
                setFetchReviewers(true);
            }).catch(error => {

            })
        }
    }, [fetchPaper, id, newPaper])

    useEffect(() => {
        if (!newPaper && fetchReviewers) {
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
    }, [assigned, fetchReviewers, id, newPaper, nominated])

    const handleChange = (e, { name, value }) => {
        setPaper({
            ...paper,
            [name]: value
        });

        if (!newPaper)
            setChanged({
                ...changed,
                [name]: value
            })
        else
            setChanged({ new_journal: true });
    }

    const saveAll = e => {


        let formData = new FormData();
        if (newFile) {
            formData.append("file", newFile);
            formData.append("title", paper.title);
        }

        API.post(`/api/paper/${newPaper ? 'upload' : `${id}/edit`}`, (newPaper || newFile) ?
            formData : paper
        ).then((response) => {
            if (response.data.success) {
                setError({})
                setChanged({})
                if (response.data.paper)
                    history.replace(`/researcher/papers/${response.data.paper.id}/view`)
            }
        }).catch((error => {
            console.error(error.response);
            setError(error.response.data.errors);
        }))
    }

    const saveField = (name, value) => {

        let formData = new FormData();
        if (newFile) {
            formData.append("file", newFile);
        }

        API.post(`/api/paper/${id}/edit`, name === 'file' ? formData
            : {
                [name]: value
            }).then((response) => {
                if (response.data.success) {
                    setError({
                        ...error,
                        [name]: false
                    })
                    setChanged({
                        ...changed,
                        [name]: false
                    })
                }

                if (response.data.new_file_path) {
                    setPaper({
                        ...paper,
                        file_path: response.data.new_file_path
                    })
                    setChanged({
                        ...changed,
                        file: false
                    })

                    setNewFile(null);
                    setEditPaperFile(false);
                }
            }).catch((error => {
                console.error(error.response);
                setError(error.response.data.errors);
            }))
    }

    const newNominatedReviewer = () => {
        API.post(`/api/nominated/new`, {
            paper_id: id,
            reviewer_email: reviewer
        }).then(response => {
            if (response.data.success) {
                setReviewer(null);
                setNominateReviewer(false);
                if (response.data.nominated) {
                    setNominated([...nominated, response.data.nominated]);
                    console.log(reviewers)
                    console.log(response.data.nominated)
                    setReviewers(reviewers.filter(reviewer => reviewer.key !== response.data.nominated.reviewer_email))
                }
            }
        }).catch((error => {
            console.error(error.response);
        }))
    }

    const handleReviewerChange = (e, { name, value }) => {
        setReviewer(value);
    }

    const removeNominee = nominee => {
        API.post(`/api/nominated/remove`, {
            paper_id: id,
            reviewer_email: nominee.reviewer_email
        }).then(response => {
            if (response.data.success) {
                setReviewer(null);
                setNominateReviewer(false);
                setNominated(nominated.filter(n => n.reviewer_id !== nominee.reviewer_id))
                setReviewers([...reviewers, {
                    key: nominee.reviewer_email,
                    text: nominee.reviewer,
                    value: nominee.reviewer_email
                }])
            }
        }).catch((error => {
            console.error(error.response);
        }))
    }

    const requestWidthrawal = () => {
        API.post(`/api/paper/${paper.id}/request_withdraw`).then(response => {
            if (response.data.success)
                setWithdrawn( !withdrawn ? 'awaiting' : false );
        }).catch(error => {

        })
    }

    if (!paper)
        return (
            <Container><Loader active inline='centered' /></Container>
        )
    return (
        <Container>
            { withdrawn &&
                <Message color='yellow'>
                    {withdrawn === 'awaiting' ?
                        <>
                            <Icon name='exclamation' /> The author of this paper has requested a withdrawl.
                        </>
                        : <>
                            
                            <Icon name='exclamation' /> The withdrawl request has been rejected.
                            <Button secondary size='small' onClick={e => requestWidthrawal()}>Ok :(</Button>

                        </>}
                </Message>}
            <Segment clearing vertical>
                <Header floated='left' >Paper Info</Header>
                {!newPaper && (withdrawn ?
                    <Button icon color='green'
                        labelPosition='left'
                        floated='right'
                        size='small'
                        animated
                        onClick={(e) => requestWidthrawal()}>
                        <Button.Content visible>
                            <Icon name='check' />
                            Withdrawn Requested
                        </Button.Content>
                        <Button.Content hidden>
                            <Icon name='remove' />
                            Cancel withdrawal
                        </Button.Content>
                    </Button>
                    :
                    <Button icon secondary
                        labelPosition='left'
                        floated='right'
                        size='small'
                        onClick={(e) => requestWidthrawal()}>
                        <Icon name='undo' />
                        Request Withdrawal
                </Button>)}

                {Object.keys(changed).length > 0 &&
                    Object.keys(changed).reduce((acc, current) =>
                        acc || changed[current], false) ?
                    <Button labelPosition='left'
                        floated='right'
                        icon
                        onClick={saveAll}
                        secondary
                        size='small'>
                        <Icon name='save' />
                    Save Publication
                </Button> :
                    <Button labelPosition='left'
                        floated='right'
                        icon
                        disabled
                        primary
                        size='small'>
                        <Icon name='save' />
                        Saved
                </Button>}
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
                                    icon={!newPaper && changed?.title && {
                                        name: 'save',
                                        circular: true,
                                        link: true,
                                        onClick: e => saveField('title', paper.title)
                                    }} />
                            </Form.Field>
                        </Table.Cell>
                    </Table.Row>
                    {!newPaper && <>
                        <Table.Row>
                            <Table.Cell>Status</Table.Cell>
                            <Table.Cell>
                                <PaperStatus status={paper.status} />
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Editor</Table.Cell>
                            <Table.Cell>{paper.editor}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Editor Email</Table.Cell>
                            <Table.Cell>{paper.editor_email}</Table.Cell>
                        </Table.Row>
                    </>}
                    <Table.Row>
                        <Table.Cell>File</Table.Cell>
                        <Table.Cell>

                            {(editPaperFile || newPaper) ?
                                <>
                                    <Form.Field inline className="table_select">
                                        <Form.Input placeholder="File"
                                            className="table_select"
                                            name="file"
                                            onChange={e => {
                                                setNewFile(e.target.files[0])
                                                setChanged({
                                                    ...changed,
                                                    file: true
                                                })
                                            }}
                                            type="file" />
                                    </Form.Field>
                                    {!newPaper && changed.file && <Icon name='save'
                                        circular
                                        link={true}
                                        onClick={e => saveField('file', paper.file_path)} />}
                                    {!newPaper &&
                                        <Button secondary
                                            icon
                                            onClick={e => {
                                                setEditPaperFile(false);
                                            }}>
                                            <Icon name="remove" />
                                        </Button>}
                                </>
                                :
                                <>
                                    <Button secondary
                                        icon
                                        onClick={e => {
                                            setViewPaper(true);
                                        }}
                                        labelPosition='left'>
                                        <Icon name="file alternate" />
                                View File
                            </Button>
                                    <Button secondary
                                        icon
                                        onClick={e => {
                                            setEditPaperFile(true);
                                        }}>
                                        <Icon name="pencil" />
                                    </Button>
                                </>
                            }
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
            { !newPaper && <>
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
                {nominateReviewer ?
                    <Button floated='right'
                        icon
                        color='green'
                        onClick={e => newNominatedReviewer()}
                        labelPosition='left'
                        size='small'>
                        <Icon name='save' />
                    Nominate this reviewer
                </Button>
                    :

                    <Button floated='right'
                        icon
                        primary
                        onClick={e => setNominateReviewer(true)}
                        labelPosition='left'
                        size='small'>
                        <Icon name='plus' />
                    Nominate Reviewer
                </Button>}
            </Segment>
            { ( (nominated && nominated.length > 0) || nominateReviewer) ?
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Reviewer</Table.HeaderCell>
                        <Table.HeaderCell>Reviewer Email</Table.HeaderCell>
                        <Table.HeaderCell>Remove Reviewer</Table.HeaderCell>
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

                    {nominated && nominated.map(nominee =>
                        <Table.Row key={nominee.id}>
                            <Table.Cell>{nominee.reviewer}</Table.Cell>
                            <Table.Cell>{nominee.reviewer_email}</Table.Cell>
                            <Table.Cell>
                                <Button color='red'
                                    icon
                                    onClick={e => removeNominee(nominee)}>
                                    <Icon name='remove' />
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table> : <Message color='yellow'>No nominations.</Message>}
            <Divider />
            <Segment clearing vertical>
                <Header floated='left' >Assigned Reviewers</Header>
            </Segment>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Reviewer</Table.HeaderCell>
                        <Table.HeaderCell>Reviewer Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {assigned && assigned.map(nominee =>
                        <Table.Row key={nominee.id}>
                            <Table.Cell>{nominee.reviewer}</Table.Cell>
                            <Table.Cell>{nominee.reviewer_email}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table> </>}
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
        </Container>
    )
}

export default EditPaper