import React from 'react';
import ModalContainer from '../../shared/ModalContainer';
import Portal from '../../shared/Portal';
import { CREATE_MATCH, JOIN_MATCH } from '../../utils/constants';

function ConnectToMatch({ isConnectToMatchVisisble, from }) {
  return (
    <ModalContainer>
      <ModalContainer style={{ backgroundColor: '#FFFFFF14' }}>
        <div className="flex text-4xl flex-col font-montserrat backdrop-filter backdrop-blur-md bg-dark-purple p-20 z-0 text-white text-center">
          <div className="flex items-center justify-center ">
            <div className="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
          <h1 className="whitespace-nowrap mt-8">Connecting To Your Game</h1>
          {from === CREATE_MATCH && (
            <h1>Waiting for other Player to Join The Match</h1>
          )}
          {from === JOIN_MATCH && <h1>Setting Up Your Game</h1>}
        </div>
      </ModalContainer>
    </ModalContainer>
  );
}

export default Portal(ConnectToMatch);
