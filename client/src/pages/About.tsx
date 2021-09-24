import React, {useContext} from 'react'
import { Container, ContentBlock, ContentRow, MainContent, Section } from '../components/base/base'
import { Text, } from '../typography/Text'
import { GitHubLink, EtherscanContractLink, InternalLink } from '../helpers'
import { CryptoTokensContext } from '../CryptoTokens';

export function About() {
  const { dtAddr } = useContext(CryptoTokensContext);
  return (
    <MainContent>
      <Container>
        <Section>
          <ContentBlock>
            <ContentRow>
              <h1 style={{textAlign: 'center'}}>CryptoTokens 🖤</h1>
            </ContentRow>
            <ContentRow>
              <h2>About</h2>
              <Text>
                <strong>Crypto Tokens</strong> is a project created by Brex that aims to build long-term relationships with our customers, partners, and overall community. To accomplish this, Brex will airdrop crypto tokens to those who participate in future Brex events.<br/><br/>For each event, Brex will take a picture of something meaningful. This may be a picture of the attendees or something else that represents the event. This image will then be used to generate a non-fungible token (NFT), a type of crypto token that is unique and belongs only to you. This token will serve as a ticket to join Brex's online community, enabling token holders to connect with others online. Furthermore, your token serves as a lifelong souvenir for previous Brex events you've attended.</Text>
            </ContentRow>
            <ContentRow>
              <h2>How it works</h2>
              <Text>
                During the event, you will be provided with your <strong>Event Code</strong> and <strong>Token ID</strong>. Once you receive these two values, you can claim your NFT <InternalLink to="claim" content="here "/>.
              </Text>
            </ContentRow>
            <ContentRow style={{paddingTop: 20}}>
              <EtherscanContractLink style={{position: 'absolute', bottom: 40, right: 20}} contract={dtAddr} />
              <GitHubLink style={{ position: 'absolute', bottom: 20, right: 20}} />
            </ContentRow>
          </ContentBlock>
        </Section>
      </Container>
    </MainContent>
  )
}

