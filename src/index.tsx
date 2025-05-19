import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import React from 'react';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';
import { Provider } from 'react-redux';
import { store, persistor } from './store/userStore';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import './i18n';

Amplify.configure(awsConfig);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<div className="flex justify-center items-center h-screen">Загрузка...</div>}
        persistor={persistor}
      >
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
