import React, { useEffect, useRef, useState } from 'react';
import NFTtemplate from '../../assets/chessmeme.jpeg';
import Portal from '../../shared/Portal';
import ModalContainer from '../../shared/ModalContainer';
import { saveData } from '../../utils/ipfsClient';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';

const nftaddress = '0x03771044F5f3282E78D9612e76560948075De72D';

function EndGame({ setOpen, opponent }) {
  const canvasRef = useRef(null);
  const [finalImg, setImg] = useState(null);
  const { account } = useWeb3();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const text = `Game Over! I owned \n${opponent}\nin Chess`;
    const lines = text.split('\n');
    const x = 275;
    const y = 50;
    const lineHeight = 28;
    const imageObj = new Image();
    imageObj.onload = () => {
      context.drawImage(imageObj, 10, 10);
      context.font = '16pt Calibri';
      for (let i = 0; i < lines.length; ++i) {
        context.fillText(lines[i], x, y + i * lineHeight);
      }
      context.font = '10pt Calibri';
      context.fillText(`Date: ${Date.now()}`, 650, 555);
      canvas.toBlob(function (blob) {
        setImg(blob);
      }, 'image/png');
    };
    imageObj.src = NFTtemplate;
  }, []);

  const handleClick = async () => {
    //   const imgCID = await saveData(finalImg);
    //   const metadata = {
    //     description: `awarded for beating ${opponent} in chess by  Web3Chess `,
    //     image: imgCID,
    //   };
    //   const stringifyData = await JSON.stringify(metadata);
    //   const nftCID = await saveData(stringifyData);
    //   const tokenURI = `https://ipfs.infura.io/ipfs/${nftCID}`;
    //   let contract = new ethers.Contract(nftaddress, account);
    //   let transaction = await contract.createToken(tokenURI);
    //   let tx = await transaction.wait();
    //   console.log(tx);
    //   let event = tx.events[0];
    //   let value = event.args[2];
    //   let tokenId = value.toNumber();
    //   console.log(tokenId);
  };

  return (
    <ModalContainer>
      <div
        className="absolute top-2 right-2 h-6 cursor-pointer"
        onClick={() => setOpen(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <div className="flex flex-col bg-yellow-100	 p-4">
        <canvas ref={canvasRef} width={800} height={600} />
        <div className="flex items-center justify-center">
          <button
            onClick={handleClick}
            className="bg-nav text-white text-center rounded px-4 py-2"
          >
            Mint This NFT
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}

export default Portal(EndGame);
