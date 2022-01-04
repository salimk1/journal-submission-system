import React, { useEffect, useState } from "react";

import {
    useParams,
    useHistory
} from 'react-router-dom'

import {
    Container,
    Segment,
    Loader,
    Header,
    Icon,
    Button,
    Message,
    Table,
    Form
} from 'semantic-ui-react'

import { useSelector } from 'react-redux'
import { selectUser } from '../../store/selectors/user'

import API from "../../utils/API";

import './index.css';


const questionTypes = [
    { key: 'comment', value: 'comment', text: 'Comment' },
    { key: 'scale', value: 'scale', text: 'Scale' }
]

const EditEvaluationMetric = () => {

    let history = useHistory();
    const { id } = useParams();

    const user = useSelector(selectUser);

    const [fetch, setFetch] = useState(true);
    const [evaluationMetric, setEvaluationMetric] = useState({
        name: ''
    });
    const [metrics, setMetrics] = useState(null);

    const [changed, setChanged] = useState(false);
    const [newCounter, setNewCounter] = useState(0);

    const newEM = id === 'new';

    useEffect(() => {
        if (!newEM && fetch) {
            setFetch(false);
            API.get(`/api/evaluation_metrics/${id}`).then(response => {
                if (response.data.evaluation_metric)
                    setEvaluationMetric(response.data.evaluation_metric)

                if (response.data.metrics)
                    setMetrics(response.data.metrics)
            }).catch(err => {

            })
        }
    }, [fetch, id, newEM])

    const saveEvaluationMetric = () => {
        API.post(`/api/evaluation_metrics/${newEM ? 'new' : `${id}/edit`}`, {
            name: evaluationMetric.name
        }).then(response => {
            setChanged(false);
            if (newEM)
                history.replace(`/${user.type}/evaluation_metrics/${response.data.evaluation_metric.id}/edit`)
        }).catch(err => {
            
        })
    }

    const handleChange = (e, { name, value }) => {
        setEvaluationMetric({
            ...evaluationMetric,
            [name]: value
        });
        setChanged(true);
    }

    const newQuestion = () => {
        setMetrics([{
            edit: true,
            id: 'new' + newCounter,
            question: "",
            answer_type: "",
        }, ...metrics])
        setNewCounter(newCounter + 1);
    }

    const cancelQuestion = metric_id => {
        setMetrics(metrics.filter(metric => metric.id !== metric_id));
    }

    const editQuestion = metric_id => {
        setMetrics(metrics.map(metric => metric.id === metric_id ? ({
            ...metric,
            edit: true
        }) : metric))
    }

    const saveQuestion = metric_id => {
        API.post(`/api/evaluation_metrics/${id}/add_question`, metrics.find(metric => metric.id === metric_id)).then(response => {
            setMetrics(metrics.map(metric => metric.id === metric_id ? ({
                ...metric,
                id: response.data.metric.id,
                edit: false
            }) : metric))
        }).catch(err => {

        })
    }

    const handleQuestionChange = (id, { name, value }) => {
        setMetrics(metrics.map(metric => metric.id === id ? ({
            ...metric,
            [name]: value
        }) : metric));

    }

    const removeQuestion = metric_id => {
        API.post(`/api/evaluation_metrics/${id}/remove_question`, {
            metric_id: metric_id
        }).then(response => {
            setMetrics(metrics.filter(metric => metric.id !== metric_id))
        }).catch(err => {

        })
    }

    if (user.type !== 'admin' && user.type !== 'editor')
        return (<Container><Message>Yoou are not supposed to be here</Message></Container>)

    if (!evaluationMetric)
        return (<Container><Loader active inline='centered' /></Container>)

    return (
        <Container className="view-evaluation-metric">
            <Segment clearing vertical>
                <Header floated='left' as={'div'} >
                    <Form.Field>
                        <Form.Input placeholder="Evaluation Metric Name"
                            value={evaluationMetric.name}
                            name='name'
                            onChange={handleChange} />
                    </Form.Field>
                </Header>
                {changed ?
                    <Button icon
                        size="small"
                        primary
                        labelPosition='left'
                        onClick={e => saveEvaluationMetric()}
                        floated='right'>
                        <Icon name="save" />
                Save Evaluation Metric
                 </Button> :
                    <Button icon
                        size="small"
                        primary
                        disabled
                        labelPosition='left'
                        floated='right'>
                        <Icon name="save" />
                    Evaluation Metric Saved
                </Button>
                }
            </Segment>

            { (!newEM && metrics && metrics.length > 0)
                ? <>
                    <Segment clearing vertical>
                        <Button primary icon
                            onClick={e => newQuestion()}
                            labelPosition='left' >
                            <Icon name='plus' />
                    Add Question
                    </Button>
                    </Segment>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Question</Table.HeaderCell>
                                <Table.HeaderCell>Answer Type</Table.HeaderCell>
                                <Table.HeaderCell>Actions</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {metrics.map(metric =>
                                <Table.Row>
                                    <Table.Cell>
                                        {metric.edit ? <Form.Field>
                                            <Form.Input placeholder="Question"
                                                name="question"
                                                value={metric.question}
                                                onChange={(e, { name, value }) => handleQuestionChange(metric.id, { name, value })} />
                                        </Form.Field> :
                                            metric.question}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {metric.edit ?
                                            <Form.Select placeholder="Question Type"
                                                name="answer_type"
                                                options={questionTypes}
                                                value={metric.answer_type}
                                                onChange={(e, { name, value }) => handleQuestionChange(metric.id, { name, value })} /> :
                                            metric.answer_type}
                                    </Table.Cell>
                                    <Table.Cell textAlign='center'>
                                        {metric.edit ?
                                            <>
                                                <Button icon
                                                    primary
                                                    onClick={e => saveQuestion(metric.id)}
                                                    labelPosition="left">
                                                    <Icon name="save" />
                                    Save question
                                </Button>
                                                <Button icon
                                                    onClick={e => cancelQuestion(metric.id)}
                                                    color="red"
                                                    labelPosition="left">
                                                    <Icon name="remove" />
                                    Cancel question
                                </Button>
                                            </> :
                                            <>
                                                <Button icon
                                                    primary
                                                    onClick={e => editQuestion(metric.id)}
                                                    labelPosition="left">
                                                    <Icon name="pencil" />
                                    Edit question
                                </Button>
                                                <Button icon
                                                    color="red"
                                                    onClick={e => removeQuestion(metric.id)}
                                                    labelPosition="left">
                                                    <Icon name="remove" />
                                    Remove question
                                </Button>
                                            </>
                                        }
                                    </Table.Cell>
                                </Table.Row>)}
                        </Table.Body>
                    </Table>
                </> : !newEM &&
                <Message>
                    There are no questions for this metric
                    <Button primary icon
                        size="small"
                        className="margin-button"
                        onClick={e => newQuestion()}
                        labelPosition='left' >
                        <Icon name='plus' />
                            Add Question
                    </Button>
                </Message>}
        </Container>
    );
};

export default EditEvaluationMetric;
