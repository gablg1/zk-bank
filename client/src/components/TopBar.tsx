import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Colors, Shadows, Sizes, Transitions } from '../global/styles'
import { HeaderContainer } from './base/base'
import { useMediaQuery } from 'react-responsive'


export function TopBar() {
  const isDesktopOrLaptop = useMediaQuery({query: '(min-width: 800px)'});
  return (
    <Header>
      <HeaderContainer>
        <HeaderNav>
          { isDesktopOrLaptop &&
            <ToMain href="/">
              <span>Crypto Tokens</span>
              <ToMainBottom>
                Made with <EmojiSpacing>🖤</EmojiSpacing> by Brex
              </ToMainBottom>
            </ToMain>
          }
          <HeaderNavLinks>
            <HeaderLink activeClassName="active-page" to="/claim">
              {' '}
              Claim your NFT{' '}
            </HeaderLink>
            <HeaderLink activeClassName="active-page" to="/all">
              {' '}
              All NFTs{' '}
            </HeaderLink>
          </HeaderNavLinks>
        </HeaderNav>
      </HeaderContainer>
    </Header>
  )
}

const Header = styled.header`
  display: flex;
  position: fixed;
  top: 0;
  align-items: center;
  width: 100%;
  height: ${Sizes.headerHeight};
  background-color: ${Colors.Brex.White};
  box-shadow: ${Shadows.main};
  z-index: 100;
`

const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
`

const ToMain = styled.a`
  display: flex;
  flex-direction: column;
  width: fit-content;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  transition: ${Transitions.all};

  &:hover {
    color: ${Colors.Brex.Orange};
  }
`

const ToMainBottom = styled.span`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 4px;
  align-items: center;
  width: fit-content;
  font-size: 10px;
  line-height: 14px;
  font-weight: 500;
`

const EmojiSpacing = styled.span`
  letter-spacing: -0.3em;
`

const HeaderNavLinks = styled.div`
  display: grid;
  position: absolute;
  left: 50%;
  grid-auto-flow: column;
  align-items: center;
  grid-column-gap: 20px;
  align-items: center;
  height: 100%;
  transform: translateX(-50%);
`

const HeaderLink = styled(NavLink)`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 10px;
  font-size: 12px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: ${Transitions.all};
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    width: calc(100% - 20px);
    height: 2px;
    background-color: ${Colors.Brex.Orange};
    transform: scaleX(0);
    transform-origin: 50% 50%;
    transition: ${Transitions.all};
  }

  &:hover {
    color: ${Colors.Brex.Orange};

    &:after {
      transform: scaleX(1);
    }
  }
  &.active-page {
    &:after {
      transform: scaleX(1);
    }
  }
`
