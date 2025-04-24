import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function Home() {
  const { user, signOut } = useAuthenticator();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Hello {user?.signInDetails?.loginId}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

export default Home;
