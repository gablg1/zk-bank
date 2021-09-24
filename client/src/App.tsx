import React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { Page } from './components/base/base'
import { TopBar } from './components/TopBar'
import { GlobalStyle } from './global/GlobalStyle'
import { Landing } from './pages/Landing'
import { ClaimPage } from './pages/Claim'
import { QRCodes } from './pages/QRCodes'
import { CreateEvent } from './pages/CreateEvent'
import { All } from './pages/All'
import { NotificationsList } from './components/Transactions/History'
import 'bootstrap/dist/css/bootstrap.min.css'

export function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/claim-raw/:eventId/:fraction" render={({match}) => {
          return (
            <ClaimPage eventId={match.params.eventId} fraction={parseInt(match.params.fraction)} />
          );
        }} />
        <Route path="/qrcodes/:eventId/:numOfSlots" render={({match}) => {
          return (
            <QRCodes eventId={match.params.eventId} numOfSlots={parseInt(match.params.numOfSlots)} />
          );
        }} />
        <Route exact path="/" component={Landing} />
        <Route component={StandaloneApp} />
      </Switch>
    </BrowserRouter>
  )
}

export function StandaloneApp() {
  return (
    <Page>
      <GlobalStyle />
        <TopBar />
        <Switch>
          <Route path="/claim/:eventId/:fraction" render={({match}) => {
            return (
              <ClaimPage eventId={match.params.eventId} fraction={parseInt(match.params.fraction)} />
            );
          }} />
          <Route exact path="/all" component={All} />
          <Route exact path="/create" component={CreateEvent} />
          <Redirect exact from="/" to="/about" />
        </Switch>
      <NotificationsList />
    </Page>
  );
}
