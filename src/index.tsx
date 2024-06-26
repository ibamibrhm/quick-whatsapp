import React, { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

interface WrappedCompProps {
  appUpdatePending: boolean;
  updateAction: () => void;
};

const withSwRegistration = (WrappedComp: FC<WrappedCompProps>) => {
  return () => {
    // holds all the SW registration setup
    const [appUpdatePending, setAppUpdatePending] = useState(false);
    // updates the state when a new update is pending.
    const onSWUpdate = () => {
      setAppUpdatePending(!appUpdatePending);
    }
    // action for updating the service worker.
    const updateAction = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.waiting) {
            // send the skip message to kick off the service worker install.
            registration.waiting.postMessage({type: 'SKIP_WAITING'});
            // add an listener to reload page when the new service worker is ready.
            registration.waiting.addEventListener('statechange', (event: Event) => {
              const { state = '' } =  event.target as unknown as {state: string} || {};
              if (state === 'activated') {
                window.location.reload();
              }
            });
          }
        });
      }
    };
    // effect added from router location to check for a new service worker on every
    // page transition (change of route). 
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    }, []);

    // registers the service worker based on config setting.
    serviceWorkerRegistration.register({ onUpdate: onSWUpdate });

    return (
      <WrappedComp updateAction={updateAction} appUpdatePending={appUpdatePending} />
    )
  }
};

const AppWithSwRegistration = withSwRegistration(App);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWithSwRegistration />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
