import React from 'react'
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { withAuthenticator } from '@aws-amplify/ui-react';

function Home() {
  return (
    <Authenticator>
    {({ signOut, user }) => (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1>Hello {user?.signInDetails?.loginId}</h1>
        <button onClick={signOut}>Sign Out</button>
      </div>
    )}
  </Authenticator>
  )
}

export default withAuthenticator(Home);