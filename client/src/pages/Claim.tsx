import React, { useEffect, useState, useContext } from 'react'
import { useContractFunction, useEthers } from '@usedapp/core'
import { Container, ContentBlock, ContentRow, MainContent, Section, SectionRow } from '../components/base/base'
import ImageCard from '../components/ImageCard';
import { AccountButton } from '../components/account/AccountButton'
import { Subtitle, Title } from '../typography/Title'
import { Table, InputGroup, FormControl } from 'react-bootstrap';
import { LoginButton } from "../components/account/AccountButton";
import { BsQuestionCircle } from "react-icons/bs";
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { CryptoTokensContext } from '../CryptoTokens';
import { Contract } from '@ethersproject/contracts'
import ClaimableTokens from '../abi/ClaimableTokens.json'
import { utils } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { zeroAddr, _useContractCall, OpenSeaLink } from '../helpers';
import { useNft } from "use-nft"
import { useLocation, useHistory } from 'react-router-dom'

export function ClaimPage(props: {eventId: number, fraction: number}) {
  const { active, chainId } = useEthers();
  console.log(chainId);
  return (
    <MainContent>
      <Container>
        <Section>
          <SectionRow>
            <Title>Claim NFT</Title>
            <AccountButton />
          </SectionRow>
          <ContentBlock>
            <ContentRow>
              {active && chainId.toString() === '1' &&
                <Claim eventId={props.eventId} fraction={props.fraction} />
              }
              {active && chainId.toString() !== '1' &&
                  <div>Please connect your wallet to the Ethereum Mainnet. You're currently connected to a network with Chain ID {chainId}</div>
              }
            </ContentRow>
          </ContentBlock>
        </Section>
      </Container>
    </MainContent>
  );
}


export function Claim(props: {eventId: number, fraction: number}) {
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
  const [accessCode, setAccessCode] = useState('');
  const history = useHistory();
  const location = useLocation();

  // Read from contract
  const totalSupply = useEtCall('totalSupply', [props.eventId]);
  const totalClaimed = useEtCall('totalClaimed', [props.eventId]);
  const claimedBy = useEtCall('claimedBy', [props.eventId, props.fraction]);
  const balance = useEtCall('balanceOf', [account, props.eventId]);

  const { nft } = useNft(eventTokensAddr, props.eventId.toString());

  // Write to contract
  const { state: claimState, send: claimSend} = useContractFunction(etContract, 'claimTokenFractions', { transactionName: 'claimTokenFractions' })
  const claim = async () => {
    claimSend(props.eventId, props.fraction, accessCode);
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)

    if (queryParams.has('accessCode')) {
      setAccessCode(queryParams.get('accessCode'))
      /* Leave param there for now
      queryParams.delete('accessCode')
      history.replace({search: queryParams.toString()})
      */
    }
  }, [location, history])

  if (totalSupply && BigNumber.from(0).eq(totalSupply)) {
    return <div>Event Id {props.eventId} not found.</div>
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Title>{nft && nft.name}</Title>
        <OpenSeaLink collection={eventTokensAddr} tokenId={props.eventId} style={{width: 122, display: 'flex', flexDirection: 'column'}} />
      </div>
      <ImageCard style={{marginBottom: 20, maxWidth: 700}} imageURI={nft && nft.image}/>
      <Table striped bordered hover>
        <tbody>
          <tr>
            <td>Event ID</td>
            <td>{props.eventId}</td>
          </tr>
          <tr>
            <td>Fraction ID</td>
            <td>{props.fraction}</td>
          </tr>
          <tr>
            <td>Description</td>
            <td>{nft && nft.description}</td>
          </tr>
          {totalSupply &&
            <tr>
              <td>Total fractions minted</td>
              <td>{totalSupply.toString()}</td>
            </tr>
          }
          {totalClaimed&&
            <tr>
              <td>Total fractions claimed</td>
              <td>{totalClaimed.toString()}</td>
            </tr>
          }
          {claimedBy && claimedBy !== zeroAddr &&
            <tr>
              <td>Fraction claimed by</td>
              <td>{claimedBy}</td>
            </tr>
          }
        </tbody>
      </Table>
      {claimedBy === zeroAddr && account &&
        <>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              Access Code
              <Tooltip title="The QR code given to you at the event">
                <IconButton>
                  <BsQuestionCircle />
                </IconButton>
              </Tooltip>
            </InputGroup.Text>
            <FormControl id="find-nft" aria-describedby="basic-addon3"
              onChange={(e) => setAccessCode(e.target.value)}  value={accessCode || ''} />
          </InputGroup>

        {claimState.status === 'Mining'
          ? <div>Mining transaction...</div>
          : <LoginButton onClick={claim}>Claim Fraction</LoginButton>
        }
      </>
      }
      {claimState && claimState.errorMessage && claimState.errorMessage.search("Wrong signature") &&
          <div style={{color: "red"}}>Wrong access code</div>
      }
      {(balance && balance.gt(BigNumber.from(0)))
        ? <>
            <Subtitle style={{color: "green"}}>You own {balance.toString()} fraction{balance.gt(BigNumber.from(1)) ? 's' : ''} of this NFT.</Subtitle>
            <div>You can now join our members-only <a style={{textDecoration: 'underline'}} href="https://discord.gg/xwDhVYCQvN">XERB Club Discord</a>.</div>
          </>
        : <div style={{marginTop: 20}}>Owning a single XERB token gives you access to the exclusive <a style={{textDecoration: 'underline'}} href="https://discord.gg/xwDhVYCQvN">Xerb Club Discord</a>.</div>
      }
      {(!claimedBy || (claimedBy === zeroAddr && !account)) &&
        <div>
          <div style={{marginTop: 40, fontWeight: 'bold'}}>Please connect your Crypto wallet to claim this token.</div> 
          If you don't have a Crypto Wallet yet, check out <a href="https://wallet.coinbase.com/">Coinbase Wallet</a> or <a href="https://metamask.io/">Metamask</a>
        </div>
      }
      {claimedBy && claimedBy !== zeroAddr && !account &&
        <div style={{marginTop: 40}}>This fraction was already claimed by {claimedBy}.</div>
      }
    </>

  )
}


