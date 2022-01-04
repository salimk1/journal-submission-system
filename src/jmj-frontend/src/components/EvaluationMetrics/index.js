import React, { useState, useEffect } from "react";

import {
    Container,
    Segment,
    Header,
    Button,
    Icon,
    Card,
    Divider
} from 'semantic-ui-react'

import {
    Link
} from 'react-router-dom'

import { useSelector } from 'react-redux'
import { selectUser } from '../../store/selectors/user'

import './index.css';
import API from "../../utils/API";

const EvaluationMetrics = () => {

    const user = useSelector(selectUser);
    const [evaluationMetrics, setEvaluationMetrics] = useState(null);
    const [fetch, setFetch] = useState(true);

    useEffect(() => {
        if (fetch) {
            setFetch(false);
            API.get('/api/evaluation_metrics/all').then(response => {
                if (response.data.evaluation_metrics)
                    setEvaluationMetrics(response.data.evaluation_metrics)
            }).catch(error => {

            })
        }
    }, [fetch])

    return (
        <Container className="evaluation-metrics">
            <Segment clearing vertical>
                <Header floated='left' >
                    Evaluation Metrics
                </Header>
                <Button icon
                    size="small"
                    primary
                    labelPosition='left'
                    floated='right'
                    to={`/${user.type}/evaluation_metrics/new/edit`}
                    as={Link}>
                    <Icon name='plus' />
                    New Evaluation Metric
                </Button>
            </Segment>
            <Divider hidden />
            <Card.Group>
                {evaluationMetrics && evaluationMetrics.map(em =>
                    <Card>
                        <Card.Content>
                            <Header as='h2'>{em.name}</Header>
                        </Card.Content>
                        <Card.Content extra>
                            <div className='ui two buttons'>
                                <Button icon
                                    as={Link}
                                    to={`/${user.type}/evaluation_metrics/${em.id}/view`}
                                    labelPosition='left'
                                    primary>
                                    <Icon name='eye' /> View
                                </Button>
                                {( user.type === 'admin' || user.type === 'editor' ) && <Button icon
                                    labelPosition='left'
                                    as={Link}
                                    to={`/${user.type}/evaluation_metrics/${em.id}/edit`}
                                    secondary>
                                    <Icon name='pencil' /> Edit
                                </Button>}
                            </div>
                        </Card.Content>
                    </Card>
                )}
            </Card.Group>
        </Container>
    );
};

export default EvaluationMetrics;
