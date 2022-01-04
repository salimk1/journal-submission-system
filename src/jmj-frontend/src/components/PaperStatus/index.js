import React from "react";

import './index.css';

import { Step } from 'semantic-ui-react';

const PaperStatus = ({ status='', edit=null}) => {



    return (
        <Step.Group>
            <Step active={status === 'pending_assignment'}
                link={edit ? true : false}
                onClick={e => edit && edit ('pending_assignment') }>
                <Step.Content>
                    <Step.Title>Pending Assignment</Step.Title>
                    <Step.Description>Waiting to be assigned an evaluation metric</Step.Description>
                </Step.Content>
            </Step>
            <Step  active={status === 'pending_revision'}
                link={edit ? true : false}
                onClick={e => edit && edit ('pending_revision') }>
                <Step.Content>
                    <Step.Title>Pending Revision</Step.Title>
                    <Step.Description>Waiting to be reviewed by reviewers</Step.Description>
                </Step.Content>
            </Step>
            <Step  active={status === 'pending_publication'}                
                link={edit ? true : false}
                onClick={e => edit && edit ('pending_publication') }>
                <Step.Content>
                    <Step.Title>Pending Publication</Step.Title>
                    <Step.Description>Waiting to be published</Step.Description>
                </Step.Content>
            </Step>
            <Step  active={status === 'published'}            
                link={edit ? true : false}
                onClick={e => edit && edit ('published') }>
                <Step.Content>
                    <Step.Title>Published</Step.Title>
                    <Step.Description>Published onto a journal!</Step.Description>
                </Step.Content>
            </Step>
        </Step.Group>
    );  
};

export default PaperStatus;
