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
    Modal,
    Embed,
    Message,
    Card,
    Form,
    TextArea,
    Step
} from 'semantic-ui-react'

import {
    Link,
    useParams
} from 'react-router-dom'
import API from "../../../../utils/API";

import { useSelector } from 'react-redux';
import { selectUser } from "../../../../store/selectors/user"
import PaperStatus from "../../../../components/PaperStatus";

const ViewPaper = () => {

    let { id } = useParams();
    const user = useSelector(selectUser);

    const [fetchPaper, setFetchPaper] = useState(true);
    const [paper, setPaper] = useState(null);
    const [nominated, setNominated] = useState(null);
    const [viewPaper, setViewPaper] = useState(false);
    const [assigned, setAssigned] = useState(null);
    const [withdraw, setWithdraw] = useState(false);
    const [evaluationMetric, setEvaluationMetric] = useState(null);
    const [reviews, setReviews] = useState(null);


    useEffect(() => {
        if (fetchPaper) {
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
                    setWithdraw(response.data.withdraw);
                if (response.data.evaluation_metric) {
                    if (user.type === 'reviewer')
                        setEvaluationMetric({
                            ...response.data.evaluation_metric,
                            questions: response.data.evaluation_metric.questions.map(question => ({
                                ...question,
                                answer: "",
                                sent: true,
                            }))
                        })
                    else
                        setEvaluationMetric(response.data.evaluation_metric)
                }
                if (response.data.reviews) {
                    setReviews(response.data.reviews);
                    if (user.type === 'reviewer')
                        setEvaluationMetric({
                            ...response.data.evaluation_metric,
                            questions: response.data.evaluation_metric.questions.map(question => ({
                                ...question,
                                answer: response.data.reviews.find(review => review.metric_id === question.id)?.answer,
                                sent: response.data.reviews.find(review => review.metric_id === question.id) ? true : false,
                            }))
                        })
                }

            }).catch(error => {

            })
        }
    }, [fetchPaper, id, user.type])

    const handleChange = (question_id, value) => {
        setEvaluationMetric({
            ...evaluationMetric,
            questions: evaluationMetric.questions
                .map(question => question.id === question_id ? ({
                    ...question,
                    answer: value,
                    sent: false
                }) : question)
        })
    }

    const confirmRejection = e => {
        API.post(`/api/paper/${id}/request_withdraw`).then(response => {
            if (response.data.success) {
                setWithdraw(false);
            }
        }).catch(error => {

        })
    }

    const editAnswer = metric_id => {
        setEvaluationMetric({
            ...evaluationMetric,
            questions: evaluationMetric.questions
                .map(question => question.id === metric_id ? ({
                    ...question,
                    sent: false
                }) : question)
        })
    }

    const sendAnswer = (question_id, answer) => {
        API.post(`/api/paper/${id}/review`, {
            question_id: question_id,
            answer: answer
        }).then(response => {
            setEvaluationMetric({
                ...evaluationMetric,
                questions: evaluationMetric.questions
                    .map(question => question.id === question_id ? ({
                        ...question,
                        sent: true
                    }) : question)
            })
        }).catch(error => {

        });
    }

    if (!paper)
        return (
            <Container><Loader active inline='centered' /></Container>
        )
    return (
        <Container>
            { withdraw &&
                <Message color='yellow'>
                    {withdraw === 'awaiting' ?
                        <>
                            <Icon name='exclamation' /> The author of this paper has requested a withdrawl.
                        </>
                        : <>

                            <Icon name='exclamation' /> The withdrawl request has been rejected.
                            {user.type === 'researcher' &&
                                <Button secondary size='small' onClick={e => confirmRejection()}>Ok :(</Button>
                            }

                        </>}
                </Message>}
            <Segment clearing vertical>
                <Header floated='left' >Paper Info</Header>
                {user.type === 'researcher' &&
                    <Button floated='right'
                        icon
                        secondary
                        to={`/researcher/papers/${id}/edit`}
                        as={Link}
                        labelPosition='left'
                        size='small'>
                        <Icon name='plus' />
                    Edit Paper
                </Button>}
            </Segment>
            <Table definition>
                <Table.Body>
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
                    { paper.editor && <>
                    <Table.Row>
                        <Table.Cell>Editor</Table.Cell>
                        <Table.Cell>{paper.editor}</Table.Cell>
                    </Table.Row> 
                    <Table.Row>
                        <Table.Cell>Editor email</Table.Cell>
                        <Table.Cell>{paper.editor_email}</Table.Cell>
                    </Table.Row> </>}
                    {user.type === 'reviewer' && <>
                        <Table.Row>
                            <Table.Cell>Researcher</Table.Cell>
                            <Table.Cell>{paper.researcher}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Researcher email</Table.Cell>
                            <Table.Cell>{paper.researcher_email}</Table.Cell>
                        </Table.Row>
                    </>}
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
            { evaluationMetric && evaluationMetric.questions && evaluationMetric.questions.length > 0 && <>
            <Divider />
            <Segment clearing vertical>
                <Header>Evaluation Metric: {evaluationMetric?.name}</Header>
            </Segment>
            <Divider hidden />
            <Card.Group>
                {evaluationMetric?.questions.map(metric =>
                    <Card key={metric.id}>
                        <Card.Content>
                            <Card.Header>{metric.question}</Card.Header>
                            <Card.Meta>
                                <span>Answer Type: {metric.answer_type}</span>
                            </Card.Meta>
                            {user.type === 'reviewer' && <>
                                <Divider />
                                <p>Your Answer:</p>
                                {metric.sent ? <>
                                    {metric.answer}
                                    <Divider hidden />
                                    <Button type="submit" primary icon labelPosition='right'
                                        onClick={e => editAnswer(metric.id)}>
                                        <Icon name='pencil' />
                                         Edit answer
                                    </Button>
                                </> :
                                    <Form>
                                        {metric.answer_type === 'scale' ?
                                            <Form.Input type="number"
                                                placeholder="Your answer"
                                                value={metric.answer}
                                                onChange={(e, { name, value }) => handleChange(metric.id, value)} />
                                            :
                                            <TextArea cols="27" name="answer"
                                                placeholder="Your answer"
                                                value={metric.answer}
                                                onChange={(e, { name, value }) => handleChange(metric.id, value)} />}
                                        <Divider hidden />
                                        <Button type="submit" primary icon labelPosition='right'
                                            onClick={e => sendAnswer(metric.id, metric.answer)}>
                                            <Icon name='send' />
                                    Send
                                </Button>
                                    </Form>}
                            </>}
                        </Card.Content>
                    </Card>)}
            </Card.Group> </> }
            { reviews && reviews.length > 0 && <>
            <Divider />
            <Segment clearing vertical>
                <Header>Reviews:</Header>
            </Segment>
            <Divider hidden />
            <Card.Group>
                {reviews?.map(review =>
                    <Card key={review.id}>
                        <Card.Content>
                            <Card.Header>{review.question}</Card.Header>
                            By: {review.reviewer}
                            <Card.Meta>
                                <span>Answer Type: {review.answer_type}</span>
                            </Card.Meta>
                            <Divider />
                            {review.answer}
                        </Card.Content>
                    </Card>)}
            </Card.Group> </> }
            { nominated && nominated.length > 0 && <>
            <Divider />
            <Segment clearing vertical>
                <Header floated='left' >Nominated Reviewers</Header>
            </Segment>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Reviewer</Table.HeaderCell>
                        <Table.HeaderCell>Reviewer Email</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {nominated && nominated.map(nominee =>
                        <Table.Row key={nominee.id}>
                            <Table.Cell>{nominee.reviewer}</Table.Cell>
                            <Table.Cell>{nominee.reviewer_email}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table></>}
            { assigned && assigned.length > 0 && <>
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
            </Table> </> }
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

export default ViewPaper