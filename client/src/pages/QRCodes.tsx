import React, { useState, useEffect } from 'react'
import { utils, Wallet } from 'ethers'
import _ from 'lodash';
import { useLocation, } from 'react-router-dom'
import QRCode from "react-qr-code";


const hash = (tokenId, n) => {
  return utils.arrayify(utils.keccak256(utils.defaultAbiCoder.encode(["uint256", "uint256"], [tokenId, n])));
}


const sign = async (signer, tokenId, n) => {
  return await signer.signMessage(hash(tokenId, n));
}


export function QRCodes(props: {eventId: number, numOfSlots: number}) {
  const [rows, setRows] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const wallet = new Wallet(queryParams.get('key'));
    async function getSignatures() {
      const rows = await Promise.all(_.range(props.numOfSlots).map(async (i) => {
        const signature = await sign(wallet, props.eventId, i);
        return [props.eventId, i, signature];
      }));
      setRows(rows);
    }

    getSignatures();
  }, [props.numOfSlots, props.eventId, location.search]);

  return (
    <>
    {rows.map(([eventId, fraction, signature]) => {
      const url = `https://crypto-tokens.netlify.app/claim-raw/${eventId}/${fraction}?accessCode=${signature}`;
      return (
        <div style={{margin: 50}}>
          <a href={url}>{url}</a>
          <QRCode value={url} size={200} />
        </div>
      );
    })}
    </>
  );
}
