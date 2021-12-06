import React, { useState, useEffect, useRef } from 'react';
import Chess from 'chess.js';
import Chessground from 'react-chessground';
import { makeFileObjects, storeFiles } from '../utils/web3storage';
import Clock from '../components/Clock';
import { useClock } from '../contexts/ClockContext';
import Promotion from '../components/modal/Promotion';
import MintWinnerCanvasNFT from '../components/modal/MintWinnerCanvasNFT';
import { useLocation, useNavigate } from 'react-router-dom';
import { MemoizedMoves } from '../components/Moves';
import PageContainer from '../shared/PageContainer';
import { useMoralisDapp } from '../contexts/MoralisDappProvider';
import MintChessGIF from '../components/modal/MintChessGIF';
import WinModal from '../components/modal/WinModal';
import LossModal from '../components/modal/LossModal';

import '../styles/chessground.css';
import '../styles/chessboard.css';
import Moralis from 'moralis';
const testPgn =
  '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7';
// ## pass code && game data from context
function Play({ vsComputer }) {
  // const testCode =
  // '0xDc9FC2d9aB39B4dE70Cbae0A095A2a7d2Cf75065/chess/1637443792940';
  const testCode = 'QmWyw1p3qvhFc3mRBQF7EHrRMXsXqjVkkDwMNeQfmo8VDr';
  const { walletAddress } = useMoralisDapp();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);
  const isClockStarted = useRef(false);
  const [code, setCode] = useState(testCode);
  const startColor =
    walletAddress?.toLowerCase() ===
    '0xdc9fc2d9ab39b4de70cbae0a095a2a7d2cf75065'
      ? 'white'
      : 'black';
  const { state } = useLocation();
  const { startClock, whiteTime, blackTime } = useClock();
  const [chess] = useState(new Chess());
  const [haveBothPlayerJoined, setBothPlayersJoined] = useState(false);
  const pendingMove = useRef({ from: null, to: null });
  const [isMyMove, setIsMyMove] = useState(true);
  const [lastMove, setLastMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [orientation, setOrientation] = useState(startColor);
  const [color, setColor] = useState(startColor);
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [isWinModalOpen, setWinModalOpen] = useState(false);
  const [isLossModalOpen, setLossModalOpen] = useState(true);
  const [game, setGame] = useState({
    code: testCode,
    startColor: startColor,
    white: {
      address: '0xDc9FC2d9aB39B4dE70Cbae0A095A2a7d2Cf75065',
      remainingTime: 10,
    },
    black: {
      address: '0x5B2020eC8F845CfeC08f1941395ca7d1Abe47cf3',
      remainingTime: 10,
    },
  });
  const [trackMoves, setMoves] = useState([]);
  const [isWinnerCanvasNFTopen, setWinnerCanvasNFTOpen] = useState(false);
  const [isChessGIFmodalOpen, setChessGIFmodalOpen] = useState(false);
  const opponentColor = startColor === 'white' ? 'black' : 'white';

  const home = game[startColor];
  const opponent = game[opponentColor];

  const ChessMatch = Moralis.Object.extend(code);

  // Size of the Chess Board
  const boardsize =
    Math.round((Math.min(window.innerWidth, window.innerHeight) * 0.75) / 8) *
    8;

  // Get the color whose turn is
  const turnColor = () => (chess.turn() === 'w' ? 'white' : 'black');

  // Check which pieces can be moved and where
  const calcMovable = () => {
    const dests = new Map();
    if (isMyMove) {
      chess.SQUARES.forEach(s => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length)
          dests.set(
            s,
            ms.map(m => m.to),
          );
      });
    }
    return {
      free: false,
      dests,
    };
  };

  // saving to Moralis
  const saveMove = async (from, to, pgn, by) => {
    const chessMatch = new ChessMatch();

    chessMatch.set('type', 'move');
    chessMatch.set('move', { from, to });
    chessMatch.set('pgn', pgn);
    chessMatch.set('by', by);
    chessMatch.set('time', { whiteTime, blackTime });

    await chessMatch.save();
  };

  async function updateLog() {
    console.log(chess.history());
    startClock();

    const moves = chess.history();
    setMoves(prevMoves => [...prevMoves, moves[moves.length - 1]]);

    if (chess.in_threefold_repetition()) {
      //  ### End this Match Here and return
    }

    if (chess.game_over() || whiteTime <= 0 || blackTime <= 0) {
      let winnerAddress = null;
      let finalComment = '';
      let isMatchDrawn = false;

      if (whiteTime <= 0) {
        winnerAddress = game['black'].address;
        finalComment = ` ${winnerAddress} wins on time. `;
        chess.header('Termination', 'Time forfeit');
      } else if (blackTime <= 0) {
        winnerAddress = game['black'].address;
        finalComment = ` ${winnerAddress} wins on time. `;
        chess.header('Termination', 'Time forfeit');
      } else if (chess.in_stalemate()) {
        isMatchDrawn = true;
        finalComment = ' Draw by stalemate. ';
      } else if (chess.in_draw() && !chess.insufficient_material()) {
        isMatchDrawn = true;
        finalComment = ' Draw by 50 move rule. ';
      } else if (chess.in_draw() && chess.insufficient_material()) {
        isMatchDrawn = true;
        finalComment = ' Draw by insufficent material. ';
      } else if (chess.in_checkmate()) {
        if (chess.history.length % 2 === 1) {
          winnerAddress = game['white'].address;
        } else {
          winnerAddress = game['black'].address;
        }
        finalComment = ` ${winnerAddress} wins by checkmate. `;
      } else if (chess.in_threefold_repetition()) {
        isMatchDrawn = true;
        finalComment = ' Draw by threefold repetition. ';
      }

      chess.set_comment(finalComment);

      chess.header(
        'Event',
        'Chess Game',
        'Date',
        Date.now(),
        'White',
        game.white.address,
        'Black',
        game.black.address,
        'Result',
        isMatchDrawn ? 'Match Drawn' : `${winnerAddress} won the match`,
      );

      const movesPlayed = chess.history();
      const data = {
        game,
        pgn: chess.pgn(),
        moves: movesPlayed,
      };

      const gameFile = makeFileObjects(data);
      const gameCID = storeFiles(gameFile);
      //  Save to Chain here

      //  Start End game here
      if (
        !vsComputer &&
        winnerAddress.toLowerCase() === home.address.toLowerCase()
      ) {
        setWinModalOpen(true);
      } else if (
        !vsComputer &&
        winnerAddress.toLowerCase() === opponent.address.toLowerCase()
      ) {
        setLossModalOpen(true);
      }
    }

    return '';
  }

  //  Random Move for Computer
  const randomMove = () => {
    const moves = chess.moves({ verbose: true });
    const move = moves[Math.floor(Math.random() * moves.length)];
    if (moves.length > 0) {
      chess.move(move.san);
      setFen(chess.fen());
      setLastMove([move.from, move.to]);
      setChecked(chess.in_check());
    }
    setIsMyMove(true);
    updateLog();
  };

  const onMove = async (from, to) => {
    const moves = chess.moves({ verbose: true });

    for (let i = 0, len = moves.length; i < len; i += 1) {
      if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
        pendingMove.current.from = from;
        pendingMove.current.to = to;
        if (turnColor() === startColor) {
          setSelectVisible(true);
        }
        return;
      }
    }

    if (chess.move({ from, to, promotion: 'q' })) {
      setFen(chess.fen());
      setLastMove([from, to]);
      setChecked(chess.in_check());
      setColor(turnColor());
      if (vsComputer) {
        setTimeout(randomMove, 500);
      } else {
        saveMove(from, to, chess.pgn(), home.address);
      }
    }
    updateLog();
  };

  const promotion = async e => {
    const from = pendingMove.current.from;
    const to = pendingMove.current.to;

    chess.move({ from, to, promotion: e });
    setFen(chess.fen());
    setLastMove([from, to]);
    setSelectVisible(false);
    setChecked(chess.in_check());
    setColor(turnColor());
    if (vsComputer) {
      setTimeout(randomMove, 500);
    } else {
      const chessMatch = new ChessMatch();

      chessMatch.set('type', 'move');
      chessMatch.set('move', { from, to, promotion: e });
      chessMatch.set('pgn', chess.pgn());
      chessMatch.set('by', home.address);
      chessMatch.set('time', { whiteTime, blackTime });

      await chessMatch.save();
    }
    updateLog();
  };

  useEffect(() => {
    const listenToEvents = async () => {
      let query = new Moralis.Query(code);
      let subscription = await query.subscribe();

      subscription.on('create', obj => {
        if (obj.attributes.type === 'move') {
          if (home.address.toLowerCase() !== obj.attributes.by.toLowerCase()) {
            //  This Move was played by opponent
            const { move } = obj.attributes;
            const { from, to, promotion } = move;

            const moveResult = chess.move({ from, to, promotion });
            if (moveResult) {
              setFen(chess.fen());
              setLastMove([from, to]);
              setChecked(chess.in_check());
              setIsMyMove(true); // can play now
              updateLog();
            }
          } else {
            //  It was My Move
            setIsMyMove(false);
          }
        }
      });
    };
    listenToEvents();
  }, []);

  return (
    <PageContainer>
      <div className="flex items-center justify-center mt-16 w-full text-white">
        <div className="flex flex-col">
          <div
            id="opponent-timer"
            className="flex justify-between items-center"
          >
            <h1 className="font-montserrat text-sm tracking-wider">
              {opponent.address}
            </h1>
            <Clock
              playerTime={opponentColor === 'white' ? whiteTime : blackTime}
            />
          </div>

          <Chessground
            width={boardsize}
            height={boardsize}
            turnColor={turnColor()}
            movable={calcMovable()}
            lastMove={lastMove}
            fen={fen}
            onMove={onMove}
            highlight={{
              check: true,
              lastMove: true,
            }}
            premovable={{
              enabled: true,
              showDests: true,
              castle: true,
            }}
            check={isChecked}
            orientation={orientation}
          />
          <div className="flex justify-between items-center mt-2">
            <h1 className="font-montserrat">{home.address}</h1>
            <Clock
              playerTime={startColor === 'white' ? whiteTime : blackTime}
            />
          </div>
        </div>
        {selectVisible && <Promotion promotion={promotion} />}
        {isWinnerCanvasNFTopen && (
          <MintWinnerCanvasNFT
            setOpen={setWinnerCanvasNFTOpen}
            opponent={opponent.address}
          />
        )}
        {isChessGIFmodalOpen && (
          <MintChessGIF
            isChessGIFmodalOpen={isChessGIFmodalOpen}
            setChessGIFmodalOpen={setChessGIFmodalOpen}
            pgn={testPgn}
            // pgn={chess.pgn()}
            movesHash="hdhhdhdhdhdhhddh"
          />
        )}
        {isWinModalOpen && (
          <WinModal
            setOpen={setWinModalOpen}
            setWinnerCanvasNFTOpen={setWinnerCanvasNFTOpen}
            setChessGIFmodalOpen={setChessGIFmodalOpen}
          />
        )}
        {isLossModalOpen && <LossModal setOpen={setLossModalOpen} />}
        <div className="self-start min-w-1/4 h-full my-auto">
          <MemoizedMoves trackMoves={trackMoves} boardSize={boardsize} />
        </div>
      </div>
    </PageContainer>
  );
}

export default Play;
