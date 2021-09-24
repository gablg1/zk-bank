import React from 'react'
import ReactDOM from 'react-dom'
import { useEthers, ChainId, DAppProvider } from '@usedapp/core'
import { App } from './App'
import { CryptoTokensContext } from './CryptoTokens'
import { NftProvider } from "use-nft"

const config = {
  readOnlyChainId: ChainId.Mainnet,
  readOnlyUrls: {
    [ChainId.Mainnet]: 'https://eth-mainnet.alchemyapi.io/v2/fkTVf8kXxNZEkz6W1cjHik5rFC1g92D6',
  },
  multicallAddresses: {
    // FIXME should be passed via process.env
    '31337': process.env.REACT_APP_MULTICALL_ADDR ?? ''
  }
}

const chains = {
  // Ethereum Mainnet
  "1": {
    name: 'Ethereum',
    eventTokensAddr: '0x97857b2020326a954cea75ff5d1e2d1045fde3c4',
  },

  // Polygon Mainnet
  "137": {
    name: 'Polygon',
    eventTokensAddr: '0xd1ffBb04d12AA6003Bb9ee9b53468049497e3f0f',
  },
  // Hardhat local
  "31337": {
    name: 'Hardhat',
    eventTokensAddr: process.env.REACT_APP_ET_ADDR,
  }
}

function WrappedApp() {
  const { library } = useEthers();
  const chainId = '1'
  return  (
    <CryptoTokensContext.Provider value={{
      eventTokensAddr: (chains[chainId].eventTokensAddr ?? ''),
    }}>
      <NftProvider fetcher={["ethers", {provider: library}]} jsonProxy={(url) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      }>
        <App />
      </NftProvider>
    </CryptoTokensContext.Provider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <WrappedApp />
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
