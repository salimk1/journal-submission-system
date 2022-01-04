import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from '../../../../utils/API';
import { Link} from "react-router-dom";
import { Container, Header, Table, Icon, Button, Segment, Modal, 
    Loader, Embed} from "semantic-ui-react";

import './index.css';

const ViewPapersRes = () => {

    // create variables
    const [fetch, setFetch] = useState(true);
    const [ papers, setPapers] = useState([]);
    const [ viewPaper, setViewPaper ] = useState(false);
    const [ paper, setPaper ] = useState(null);
    let {id} = useParams();   // func = hook

    // fetch all papers by the researcher
    useEffect(() => {
        if(fetch) {
            setFetch(false);
            API.get(`/api/paper/by_researcher/${id}`).then(response => {
                if (response.data.papers)
                    setPapers(response.data.papers);
            }).catch(error => {
                console.log(error);
            })
        }
    },[fetch, id]);

    // return 
    if (!papers) {
        return (
            <Container>
                <Loader />
            </Container>
        )
    }

    return (
        <Container className="view-papers-res">
            <Header floated='left'>View Papers By Researcher</Header>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Paper Id</Table.HeaderCell>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>File</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {papers.map(paper => <Table.Row key={paper.id}>
                            <Table.Cell>{paper.id}</Table.Cell>
                            <Table.Cell>{paper.title}</Table.Cell>
                            <Table.Cell>{paper.status}</Table.Cell>
                            <Table.Cell>
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
                            </Table.Cell>
                            <Table.Cell textAlign='center'>
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
                        </Table.Row>)}
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

export default ViewPapersRes;