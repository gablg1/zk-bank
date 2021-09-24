import React, { useState, useContext } from 'react'
import { useContractFunction, useEthers } from '@usedapp/core'
import { Container, ContentBlock, ContentRow, MainContent, Section, SectionRow } from '../components/base/base'
import { AccountButton } from '../components/account/AccountButton'
import { Title } from '../typography/Title'
import { InputGroup, FormControl } from 'react-bootstrap';
import { LoginButton } from "../components/account/AccountButton";
import { BsQuestionCircle } from "react-icons/bs";
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { CryptoTokensContext } from '../CryptoTokens';
import { Contract } from '@ethersproject/contracts'
import ClaimableTokens from '../abi/ClaimableTokens.json'
import { utils } from 'ethers'
import { _useContractCall, } from '../helpers';

const hash = (tokenId, n) => {
  return utils.arrayify(utils.keccak256(utils.defaultAbiCoder.encode(["uint256", "uint256"], [tokenId, n])));
}


const sign = async (ethers, tokenId, n) => {
  return await ethers.getSigner().signMessage(hash(tokenId, n));
}

export function CreateEvent() {
  const { active, account } = useEthers();
  return (
    <MainContent>
      <Container>
        <Section>
          <SectionRow>
            <Title> </Title>
            <AccountButton />
          </SectionRow>
          <ContentBlock>
            <ContentRow>
            {active && account &&
              <InnerCreateEvent />
            }
            </ContentRow>
          </ContentBlock>
        </Section>
      </Container>
    </MainContent>
  );
}


function InnerCreateEvent() {
  const { account, library, } = useEthers();
  const { eventTokensAddr } = useContext(CryptoTokensContext);

  const etContract = new Contract(eventTokensAddr, new utils.Interface(ClaimableTokens.abi), library);
  const useEtCall = (method: string, args: any[]) => {
    return _useContractCall({
      abi: etContract.interface,
      address: eventTokensAddr,
      method: method,
      args: args,
    });
  };

  // Local state
  const [eventId, setEventId] = useState('');
  const [numOfSlots, setNumOfSlots] = useState('');
  const [fractions, setFractions] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [uri, setUri] = useState('');

  const intNumOfSlots = parseInt(numOfSlots);
  const intEventId = parseInt(eventId);
  const intFractions = parseInt(fractions);


  // Read from contract
  const registeredTokens = useEtCall('registeredTokens', []);
  console.log(registeredTokens);
  const owner = useEtCall('owner', []);


  // Write to contract
  const { send: createSend} = useContractFunction(etContract, 'createToken', { transactionName: 'createToken' })
  const createEvent = async () => {
    createSend(intEventId, intNumOfSlots, intFractions, publicKey, uri);
  }

  const downloadSignatures = async () => {
    const rows = await Promise.all(_.range(intNumOfSlots).map(async (i) => {
      const signature = await sign(library, intEventId, i);
      return [intEventId, i, signature];
    }));
    console.log(rows);

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  if (!owner) {
    return <div>Loading contract {eventTokensAddr}...</div>;
  }

  if (owner !== account) {
    console.log(owner);
    return <div>You are not the owner.</div>;
  }

  return (
    <>
      <TextInput name="Event ID" description="Choose an ID for your event (can't be repeated)"
        value={eventId || ''} onChange={(e) => setEventId(e.target.value)} />
      <TextInput name="Number of slots" description="How many people will be able to claim a token"
        value={numOfSlots || ''} onChange={(e) => setNumOfSlots(e.target.value)} />
      <TextInput name="Fractions per slot" description="Number of tokens we'll give to each person"
        value={fractions || ''} onChange={(e) => setFractions(e.target.value)} />
      <TextInput name="Public Key" description="Public Key corresponding to the Private key used to create claimable signatures for this event"
        value={publicKey || ''} onChange={(e) => setPublicKey(e.target.value)} />
      <TextInput name="Metadata URI" description="URI pointing to NFT metadata"
        value={uri || ''} onChange={(e) => setUri(e.target.value)} />

      <LoginButton onClick={createEvent}>Create Event</LoginButton>
      <LoginButton style={{paddingLeft: 10, paddingRight: 10}} onClick={downloadSignatures}>Download Signatures CSV</LoginButton>
          {/* {active && eventCode ?
            (utils.isAddress(eventCode)
              ? <NFTViewer collection={eventCode} tokenId={tokenId} />
              : <Text>Address {eventCode} is invalid</Text>
            )
          : ''} */}
    </>

  )
}


function TextInput(props: {name: string, description: string, value: string, onChange: any}) {
  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        {props.name}
        <Tooltip title={props.description}>
          <IconButton>
            <BsQuestionCircle />
          </IconButton>
        </Tooltip>
      </InputGroup.Text>
      <FormControl id="find-nft" aria-describedby="basic-addon3"
        onChange={props.onChange}  value={props.value} />
    </InputGroup>
  );
}
