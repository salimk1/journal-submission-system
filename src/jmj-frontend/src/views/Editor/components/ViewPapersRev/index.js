import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from '../../../../utils/API';
import { Link} from "react-router-dom";
import { Container, Header, Table, Icon, Button, Segment, Modal, Embed} from "semantic-ui-react";

import './index.css';

const ViewPapersRev = () => {

    // create variables
    const [fetch, setFetch] = useState(true);
    const [assigneds, setAssigneds] = useState([]);
    const [assign, setAssign] = useState(null);
    const [viewAssign, setViewAssign] = useState(false);
    let {id} = useParams();   // func = hook

    // fetch all papers by the researcher
    useEffect(() => {
        if(fetch) {
            setFetch(false);
            API.get(`/api/assigned/reviewer/${id}`).then(response => {
                if (response.data.assigneds)
                    setAssigneds(response.data.assigneds);
            }).catch(error => {
                console.log(error);
            })
        }
    },[fetch, id]);

    // return 
    return (
        <Container className="view-papers-rev">
            <Header floated='left'>View Papers Assigned to Reviewer</Header>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Paper Id</Table.HeaderCell>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Researcher Email</Table.HeaderCell>
                        <Table.HeaderCell>Revision Deadline</Table.HeaderCell>
                        <Table.HeaderCell>File</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {assigneds.map(assign => <Table.Row key={assign.id}>
                            <Table.Cell>{assign.paper_id}</Table.Cell>
                            <Table.Cell>{assign.title}</Table.Cell>
                            <Table.Cell>{assign.status}</Table.Cell>
                            <Table.Cell>{assign.researcher_email}</Table.Cell>
                            <Table.Cell>{assign.revision_deadline}</Table.Cell>
                            <Table.Cell>
                                <Button secondary
                                        icon
                                        onClick={e => {
                                            setAssign(assign)
                                            setViewAssign(true);
                                        }}
                                        labelPosition='center'>
                                    <Icon name="file alternate" />
                                    {assign.file_path}
                                </Button>                                
                            </Table.Cell>
                            <Table.Cell textAlign='center'>
                                <Button primary animated='vertical'
                                        to={`/editor/papers/${assign.paper_id}/details`}
                                        as={Link}>
                                    <Button.Content hidden>View</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='eye' />
                                    </Button.Content>
                                </Button>
                                <Button tertiary animated='vertical'
                                        to={`/editor/papers/${assign.paper_id}/edit`}
                                        as={Link}>
                                    <Button.Content hidden>Edit</Button.Content>
                                    <Button.Content visible>
                                        <Icon name='pencil' />
                                    </Button.Content>
                                </Button>
                            </Table.Cell>
                        </Table.Row>)}
                </Table.Body>
            </Table>

            <Modal
                dimmer='inverted'
                onClose={() => setViewAssign(false)}
                onOpen={() => setViewAssign(true)}
                open={viewAssign}
                size='fullscreen'>
                <Segment clearing vertical padded>
                    <Container className='file-view-header'>
                    <Button primary 
                            floated='right'
                            onClick={(e) => {
                                setViewAssign(false);
                                setAssign(null);
                        }}>
                            <Icon name='check' /> Done
                        </Button>
                        <Header textAlign='center'
                                floated='left'>
                            { assign?.title }
                            <Header.Subheader>
                                {assign?.researcher_email}
                            </Header.Subheader>
                        </Header>
                    </Container>
                </Segment>
                <Modal.Content>       
                    <Embed
                        defaultActive
                        icon='right circle arrow'
                        placeholder='/images/image-16by9.png'
                        url={`http://localhost/storage/${assign?.file_path}`}
                    />                    
                </Modal.Content>
            </Modal> 

        </Container>  

    );  
};

export default ViewPapersRev;