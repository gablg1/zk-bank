import styled from 'styled-components'
import { Colors, Transitions } from '../../global/styles'

export const Link = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  text-decoration: underline;
  color: ${Colors.Brex.Grey};
  cursor: pointer;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    color: ${Colors.Brex.Orange};
  }
`
export const InlineLink = styled.a`
  display: inline-block;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  text-decoration: underline;
  color: ${Colors.Brex.Grey};
  cursor: pointer;
  transition: ${Transitions.all};

  &:hover,
  &:focus-within {
    color: ${Colors.Brex.Orange};
  }
`