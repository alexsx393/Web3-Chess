import React, { useContext, useEffect, useState, useRef } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import CreateMatch from '../components/modal/CreateMatch';
import JoinMatch from '../components/modal/JoinMatch';
import ChessBoard from '../assets/ChessBoard.webp';
import playHand from '../assets/playhand.webp';
import Computer from '../assets/computer.webp';
import PageContainer from '../shared/PageContainer';
import { useClock } from '../contexts/ClockContext';

function Home() {
  const { connectAccount, loading, account, disconnect } =
    useContext(Web3Context);
  const { startClock, whiteTime, blackTime } = useClock();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinMatchModalOpen, setJoinModalOpen] = useState(false);

  return (
    <PageContainer>
      {isCreateModalOpen && (
        <CreateMatch setCreateModalOpen={setCreateModalOpen} />
      )}
      {isJoinMatchModalOpen && (
        <JoinMatch setJoinModalOpen={setJoinModalOpen} />
      )}
      <div className="flex mt-32 text-white items-center w-full max-w-3/4 justify-around">
        <div className="w-1/2">
          <img alt="chessboard" src={ChessBoard} height="500px" width="500px" />
        </div>
        <div className="w-1/2 h-full flex flex-col">
          <div className="flex-3/4 mb-16">
            <h1 className="text-5xl text-center font-montserrat ">
              Play Web3 Chess. Stake Money. Earn NFTs
            </h1>
          </div>
          <div className="flex-1/4">
            <div
              className={`flex items-center rounded p-2 bg-purple-900 border-play-hand-btn mb-4 border-2 cursor-pointer justify-center`}
              onClick={() => setCreateModalOpen(true)}
            >
              <Button text="Create Match" imgSrc={playHand} />
            </div>
            <div
              className={`flex items-center rounded p-2 bg-purple-900 border-play-hand-btn mb-4 border-2 cursor-pointer justify-center`}
              onClick={() => setJoinModalOpen(true)}
            >
              <Button text="Join Match" imgSrc={playHand} />
            </div>
            <div
              className={`flex items-center rounded p-2 bg-play-comp-color border-play-hand-btn mb-4 border-2 cursor-pointer justify-center`}
            >
              <Button text="Play With Computer" imgSrc={Computer} />
            </div>
            <button
              onClick={() => {
                startClock();
              }}
            >
              Click Me
            </button>
            <h2>{whiteTime}</h2>
            <h2>{blackTime}</h2>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

const Button = ({ imgSrc, text, bgColor, borderColor }) => {
  return (
    <>
      <img src={imgSrc} alt={text} width="55px" height="55px" />
      <h2 className="text-2xl font-montserrat">{text}</h2>
    </>
  );
};

export default Home;
