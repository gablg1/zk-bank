import React, {useContext} from 'react'
import { Container, ContentBlock, ContentRow, MainContent, Section } from '../components/base/base'
import { GitHubLink, EtherscanContractLink, } from '../helpers'
import { CryptoTokensContext } from '../CryptoTokens';


export function Landing () {
  const { eventTokensAddr } = useContext(CryptoTokensContext);
  return (
    <MainContent>
      <Container>
        <Section>
          <ContentBlock>
            <ContentRow>
              <div>
                <h1 style={{marginBottom: 20}}>
                  You’ve just become part of a Brex Community experiment 🖤
                </h1>
                <div style={{marginBottom: 20}}>We are minting an NFT as you enjoy a drink and the company of fellow founders and investors.</div>

                <div style={{marginBottom: 20}}>Tomorrow you will receive an email with a unique link to claim this NFT. This will give you exclusive access to our Discord channel where you can share ideas, reconnect, and access photos taken at the booth today.</div>

                <div style={{marginBottom: 35}}>So great to see you back IRL.</div>

                <EtherscanContractLink style={{position: 'absolute', bottom: 40, right: 20}} contract={eventTokensAddr} />
                <GitHubLink style={{ position: 'absolute', bottom: 20, right: 20}} />
              </div>
            </ContentRow>
          </ContentBlock>
        </Section>
      </Container>
    </MainContent>
  )
}

