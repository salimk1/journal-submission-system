import React, { useEffect, useState } from "react";

import {
    useParams,
    Link
} from 'react-router-dom'

import {
    Container,
    Segment,
    Loader,
    Header,
    Icon,
    Button,
    Message,
    Table
} from 'semantic-ui-react'

import { useSelector } from 'react-redux'
import { selectUser } from '../../store/selectors/user'

import API from "../../utils/API";

import './index.css';

const ViewEvaluationMetric = () => {

    const { id } = useParams();

    const user = useSelector(selectUser);

    const [fetch, setFetch] = useState(true);
    const [evaluationMetric, setEvaluationMetric] = useState(null);
    const [metrics, setMetrics] = useState(null);

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

    if (!evaluationMetric)
        return (<Container><Loader active inline='centered' /></Container>)
    return (
        <Container className="view-evaluation-metric">
            <Segment clearing vertical>
                <Header floated='left' >
                    {evaluationMetric.name}
                </Header>
                {(user.type === 'editor' || user.type === 'admin') &&
                    <Button icon
                        size="small"
                        primary
                        labelPosition='left'
                        floated='right'
                        to={`/${user.type}/evaluation_metrics/${id}/edit`}
                        as={Link}>
                        <Icon name="pencil" />
                    Edit Evaluation Metric
                </Button>}
            </Segment>

            { (metrics && metrics.length > 0) ? <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Question</Table.HeaderCell>
                        <Table.HeaderCell>Answer Type</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {metrics.map(metric =>
                        <Table.Row>
                            <Table.Cell>{metric.question}</Table.Cell>
                            <Table.Cell>{metric.answer_type}</Table.Cell>
                        </Table.Row>)}
                </Table.Body>
            </Table> : <Message>There are no questions for this metric</Message>}
        </Container>
    );
};

export default ViewEvaluationMetric;
