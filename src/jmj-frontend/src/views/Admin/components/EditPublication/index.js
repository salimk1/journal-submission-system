import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import API from '../../../../utils/API';
import { useHistory } from "react-router-dom";
import { Container, Header, Loader, Table, Icon, Button, Segment, Modal, Embed, Form } from 'semantic-ui-react';

import { useSelector } from 'react-redux';
import { selectUser } from '../../../../store/selectors/user'

import './index.css'

const status_types = [
    { key: 'pending', text: 'Pending', value: 'pending' },
    { key: 'approved', text: 'Approved', value: 'approved' },
    { key: 'rejected', text: 'Rejected', value: 'rejected' }
]

const EditPublication = () => {

    let { id } = useParams();
    let history = useHistory();

    const user = useSelector(selectUser);

    const [fetch, setFetch] = useState(true);
    const [journal, setJournal] = useState({
        title: "",
        published_date: "",
        status: "",
        admin_email: "",
        papers: [],
    });

    const [addPaper, setAddPaper] = useState(false);
    const [fetchPapers, setFetchPapers] = useState(false);
    const [papers, setPapers] = useState(null);

    const [viewPaper, setViewPaper] = useState(false);
    const [paper, setPaper] = useState(null);

    const [error, setError] = useState({});
    const [changed, setChanged] = useState({});

    const [admins, setAdmins] = useState(null);
    const [editors, setEditors] = useState(null);
    const [fetchUsers, setFetchUsers] = useState(true);

    const newJournal = id === 'new'

    useEffect(() => {
        if (!newJournal && id !== 'new' && fetch) {
            setFetch(false);
            API.get(`/api/journals/${id}`).then((response) => {
                if (response.data.journal)
                    setJournal(response.data.journal);
                setFetchUsers(true);
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetch, id, newJournal]);

    useEffect(() => {
        if (!newJournal && fetchPapers) {
            setFetchPapers(false);
            API.get('/api/paper/all').then((response) => {
                if (response.data.papers) {
                    setPapers(response.data.papers);
                }
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetchPapers, newJournal])

    useEffect(() => {
        if (fetchUsers) {
            setFetchUsers(false);
            API.get('/api/users/of_type/admin').then((response) => {
                if (response.data.users) {
                    setAdmins(response.data.users.map(user => ({
                        key: user.email,
                        text: user.first_name + ' ' + user.last_name,
                        value: user.email
                    })))
                }
            }).catch((error) => {
                console.error(error);
            })
            API.get('/api/users/of_type/editor').then((response) => {
                if (response.data.users) {
                    setEditors(response.data.users.map(user => ({
                        key: user.email,
                        text: user.first_name + ' ' + user.last_name,
                        value: user.email
                    })))
                }
            }).catch((error) => {
                console.error(error);
            })
        }
    }, [fetchUsers, newJournal])



    const addPaperToJournal = paper_id => {
        API.post(`/api/journals/${id}/add_paper`, {
            paper_id: paper_id,
        }).then((response) => {
            if (response.data.success) {
                setJournal({
                    ...journal,
                    papers: [...journal.papers, response.data.paper]
                })
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    const removePaperFromJournal = paper_id => {
        API.post(`/api/journals/${id}/remove_paper`, {
            paper_id: paper_id,
        }).then((response) => {
            if (response.data.success) {
                setJournal({
                    ...journal,
                    papers: journal.papers.filter(paper => paper.id !== paper_id)
                })
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    const saveField = (name, value) => {
        API.post(`/api/journals/${id}/edit`, {
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
        }).catch((error => {
            console.error(error.response);
            setError(error.response.data.errors);
        }))
    }

    const saveAll = e => {
        API.post(`/api/journals/${newJournal ? 'create' : `${id}/edit`}`, journal).then((response) => {
            if (response.data.success) {
                setError({})
                setChanged({})
                if (response.data.journal)
                    history.replace(`/admin/publications/${response.data.journal.id}/view`)
            }
        }).catch((error => {
            console.error(error.response);
            setError(error.response.data.errors);
        }))
    }

    const handleChange = (e, { name, value }) => {
        setJournal({
            ...journal,
            [name]: value
        });

        if (!newJournal)
            setChanged({
                ...changed,
                [name]: value
            })
        else
            setChanged({ new_journal: true });
    }

    if (!journal)
        return <Container><Loader active inline='centered' /></Container>

    return (
        <Container className="edit-publication">
            <Header dividing>Journal Info</Header>
            <Table definition>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>
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
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Title</Table.Cell>
                        <Table.Cell>
                            <Form.Input placeholde="Title"
                                name='title'
                                type="text"
                                value={journal.title}
                                onChange={handleChange}
                                error={error && error.title &&
                                {
                                    content: error.title.join(' & '),
                                    pointing: 'left'
                                }}
                                icon={changed?.title && {
                                    name: 'save',
                                    circular: true,
                                    link: true,
                                    onClick: e => saveField('title', journal.title)
                                }} />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Published Date</Table.Cell>
                        <Table.Cell>
                            <Form.Input placeholde="Published Date"
                                name='published_date'
                                type="date"
                                value={journal.published_date}
                                onChange={handleChange}
                                error={error && error.published_date &&
                                {
                                    content: error.published_date.join(' & '),
                                    pointing: 'left'
                                }}
                                icon={changed?.published_date && {
                                    name: 'save',
                                    circular: true,
                                    link: true,
                                    onClick: e => saveField('published_date', journal.published_date)
                                }} />
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Status</Table.Cell>
                        <Table.Cell>
                            {(user.type === 'admin') ? <>
                                <Form.Select placeholde="Status"
                                    name='status'
                                    type="date"
                                    className='table_select'
                                    options={status_types}
                                    value={journal.status}
                                    onChange={handleChange}
                                    error={error && error.status &&
                                    {
                                        content: error.status.join(' & '),
                                        pointing: 'left'
                                    }}
                                />
                                {changed?.status &&
                                    <Icon
                                        name='save'
                                        className='select_icon'
                                        circular={true}
                                        link={true}
                                        onClick={e => saveField('status', journal.status)} />
                                } </> : journal.status}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Editor</Table.Cell>
                        <Table.Cell>
                            {(user.type === 'admin') ? <>
                                <Form.Select name="editor_email"
                                    placeholder="Editor Email"
                                    className='table_select'
                                    value={journal.editor_email}
                                    onChange={handleChange}
                                    error={error && error.editor_email &&
                                    {
                                        content: error.editor_email.join(' & '),
                                        pointing: 'left'
                                    }}
                                    options={editors} />
                                {changed?.editor_email &&
                                    <Icon
                                        name='save'
                                        className='select_icon'
                                        circular={true}
                                        link={true}
                                        onClick={e => saveField('editor_email', journal.editor_email)} />
                                }
                            </> : journal.editor_email}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Admin</Table.Cell>
                        <Table.Cell>
                            {(user.type === 'admin') ?
                                <>
                                    <Form.Select name="admin_email"
                                        placeholder="Admin Email"
                                        className='table_select'
                                        value={journal.admin_email}
                                        onChange={handleChange}
                                        error={error && error.admin_email &&
                                        {
                                            content: error.admin_email.join(' & '),
                                            pointing: 'left'
                                        }}
                                        options={admins} />
                                    {changed?.admin_email &&
                                        <Icon
                                            name='save'
                                            className='select_icon'
                                            circular={true}
                                            link={true}
                                            onClick={e => saveField('admin_email', journal.admin_email)} />
                                    }
                                </> : journal.admin_email}
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>

            { !newJournal && journal.papers && <>
                <Segment clearing vertical>
                    <Header floated='left' >Papers</Header>
                    <Button floated='right'
                        icon
                        labelPosition='left'
                        onClick={e => {
                            setAddPaper(true)
                            setFetchPapers(true);
                        }}
                        primary>
                        <Icon name='plus' />
                    Add paper
                </Button>
                </Segment>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Researcher</Table.HeaderCell>
                            <Table.HeaderCell>Editor</Table.HeaderCell>
                            <Table.HeaderCell>Metric Used</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>File</Table.HeaderCell>
                            <Table.HeaderCell>Remove From Journal</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {journal.papers.map(paper => <Table.Row key={paper.id}>
                            <Table.Cell>{paper.title}</Table.Cell>
                            <Table.Cell>{paper.researcher}</Table.Cell>
                            <Table.Cell>{paper.editor}</Table.Cell>
                            <Table.Cell>{paper.em_name}</Table.Cell>
                            <Table.Cell>{paper.status}</Table.Cell>
                            <Table.Cell>
                                <Button secondary
                                    icon
                                    onClick={e => {
                                        setPaper(paper)
                                        setViewPaper(true);
                                    }}
                                    labelPosition='left'>
                                    <Icon name="file alternate" />
                                View File
                            </Button>
                            </Table.Cell>
                            <Table.Cell>
                                <Button color='red'
                                    icon
                                    onClick={e => {
                                        removePaperFromJournal(paper.id)
                                    }}>
                                    <Icon name="remove" />
                                </Button>
                            </Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </>}

            <Modal
                onClose={() => setAddPaper(false)}
                onOpen={() => setAddPaper(true)}
                open={addPaper}
                dimmer='blurring'
                size='large'>
                <Header textAlign='center'>
                    Select papers to add to {journal.title}
                </Header>
                <Modal.Content scrolling>
                    <Container textAlign='center'>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Title</Table.HeaderCell>
                                    <Table.HeaderCell>Researcher</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                    <Table.HeaderCell>File</Table.HeaderCell>
                                    <Table.HeaderCell>Action</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {papers && papers.map(paper =>
                                    <Table.Row key={paper.id}>
                                        <Table.Cell>{paper.title}</Table.Cell>
                                        <Table.Cell>{paper.researcher}</Table.Cell>
                                        <Table.Cell>{paper.status}</Table.Cell>
                                        <Table.Cell>
                                            <Button secondary
                                                icon
                                                onClick={e => {
                                                    setPaper(paper)
                                                    setViewPaper(true);
                                                }}
                                                labelPosition='left'>
                                                <Icon name="file alternate" />
                                                View File
                                            </Button>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {journal.papers.find(p => p.id === paper.id) !== undefined ?
                                                <Button color='red'
                                                    icon
                                                    animated='fade'
                                                    onClick={e => removePaperFromJournal(paper?.id)}
                                                    labelPosition='left'>
                                                    <Button.Content visible>
                                                        <Icon name="check" />
                                                    Added
                                                </Button.Content>
                                                    <Button.Content hidden>
                                                        <Icon name="delete" />
                                                    Delete
                                                </Button.Content>
                                                </Button>
                                                :
                                                <Button icon
                                                    color='violet'
                                                    onClick={e => addPaperToJournal(paper.id)}
                                                    labelPosition='left'>
                                                    <Icon name="plus" />
                                                Add to journal
                                            </Button>
                                            }
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </Container>
                </Modal.Content>
                <Modal.Actions>
                    <Button primary onClick={() => setAddPaper(false)}>
                        <Icon name='check' /> Done
                    </Button>
                </Modal.Actions>
            </Modal>

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
                        {journal.papers.find(p => p.id === paper?.id) !== undefined ?
                            <Button color='red'
                                icon
                                animated='fade'
                                floated='right'
                                onClick={e => removePaperFromJournal(paper?.id)}
                                labelPosition='left'>
                                <Button.Content visible>
                                    <Icon name="check" />
                                Added
                            </Button.Content>
                                <Button.Content hidden>
                                    <Icon name="delete" />
                                Delete
                            </Button.Content>
                            </Button>
                            :
                            <Button color='violet'
                                icon
                                floated='right'
                                onClick={e => addPaperToJournal(paper?.id)}
                                labelPosition='left'>
                                <Icon name="plus" />
                            Add to journal
                        </Button>
                        }
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
    );
}

export default EditPublication;