import React, { useState, useEffect } from "react";
import API from "../../utils/API";

import { Button, Table, Form, Icon, Card, Header, Divider,} from "semantic-ui-react";
import './index.css';

const UserTokens = () => {

    const [ tokens, setTokens ] = useState([]);
    const [ tokenName, setTokenName ] = useState("");

    
    const [ fetch, setFetch ] = useState(true);
    const [error, setError ] = useState({});

    const [ newToken, setNewToken ] = useState(null);
    const [ newTokenName, setNewTokenName ] = useState(null);

    useEffect(() => {
        if (fetch) {
            setFetch(false);
            API.get('/api/tokens/all').then( res => {
                if ( res.data.tokens )
                    setTokens(res.data.tokens);
            }).catch(err => {
                console.log(err);
            })
        }
    }, [fetch]);

    const hanleTokenNameChange = ( e, {name,value}) => {
        setTokenName(value);
    }

    const generateToken = e => {
        API.post('/api/tokens/create', {
            tokenName:tokenName
        }).then(response => {
            console.log(response);
            if (response.data.token) {
                setNewToken(response.data.token);
                setNewTokenName(tokenName);
                setTokenName("");
                setFetch(true);
            }
        }).catch(err => {
            if(err.response?.data?.errors)
					setError(err.response.data.errors)
        })
    }

    const handleTokenDelete = tokenId => {
        API.post('/api/tokens/delete', {
            tokenId:tokenId,
        }).then(response => {
            console.log(response);
            if (response.data.success)
                setTokens(tokens.filter( token => token.id !== tokenId ));
        }).catch(err => {
            console.log(err)
        })
    }

    const resetNewToken = () => {
        setNewToken(null);
        setNewTokenName(null);
    }

    return (
        <div className="user-tokens ui container middle">
            { tokens && tokens.length > 0 &&
            <Table compact celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Last Used</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { tokens.map( (token, i) => 
                        <Table.Row key={i}>
                            <Table.Cell>{token.name}</Table.Cell>
                            <Table.Cell>{token.last_used_at || 'Never used'}</Table.Cell>
                            <Table.Cell>
                                <Button icon labelPosition='left'
                                onClick={e => handleTokenDelete(token.id)}
                                        color='red' >
                                    <Icon name='delete' />
                                    Remove
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table> }
            <Divider />
            <Header size='medium'>Generate new token</Header>
            <Form>
                <Form.Field inline>
                    <label>Token Name</label>
                    <Form.Input placeholder="Token Name"
                                name="tokenName"
                                type="text"
                                value={tokenName}
                                error={ error && error.tokenName && 
                                        {content: error.tokenName.join(' & ') }}
                                onChange={hanleTokenNameChange} />
                </Form.Field>
                <Button
                    className="generateToken"
                    primary
                    onClick={generateToken}
                    size='small' >
                    Generate Token
                </Button>       
            </Form>   
            { newToken && <> 
            <Divider />
            <Card fluid>
                <Card.Content>
                    <Card.Header>New Token: { newTokenName }</Card.Header>
                    <Card.Meta>Keep it safe, you won't be able to see this token again</Card.Meta>
                    <Card.Description>
                    { newToken }
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <div className='ui two buttons'>
                    <Button primary
                            onClick={(e) => resetNewToken()}>
                        Got it, hide it now
                    </Button>
                    </div>
                </Card.Content>
            </Card> 
            </>}
        </div>
    );  
};

export default UserTokens;
