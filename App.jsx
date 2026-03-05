import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import abi from './abis/EventTicketing.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

function formatEth(wei) {
  try { return ethers.utils.formatEther(wei); } catch { return '0'; }
}

export default function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('');
  const [eventId, setEventId] = useState(0);
  const [tokenUri, setTokenUri] = useState('ipfs://example-metadata');
  const [events, setEvents] = useState([]);
  const [provider, setProvider] = useState(null);

  const contract = useMemo(() => {
    if (!provider || !CONTRACT_ADDRESS) return null;
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  }, [provider]);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus('MetaMask not detected.');
      return;
    }
    const p = new ethers.providers.Web3Provider(window.ethereum);
    await p.send('eth_requestAccounts', []);
    const signer = p.getSigner();
    const addr = await signer.getAddress();
    setProvider(p);
    setAccount(addr);
    setStatus('Wallet connected.');
  }

  async function refreshEvents() {
    if (!contract) return;
    const nextId = await contract.nextEventId();
    const items = [];
    for (let i = 0; i < nextId.toNumber(); i++) {
      const e = await contract.events(i);
      if (e.exists) {
        items.push({ id: i, name: e.name, max: e.maxTickets.toString(), minted: e.minted.toString(), priceWei: e.priceWei.toString() });
      }
    }
    setEvents(items);
  }

  async function buyTicket() {
    try {
      if (!contract) throw new Error('Contract not configured');
      setStatus('Sending transaction...');
      const e = await contract.events(eventId);
      const tx = await contract.mintTicket(eventId, tokenUri, { value: e.priceWei });
      setStatus(`Pending: ${tx.hash}`);
      const rcpt = await tx.wait(1);
      setStatus(`Confirmed in block ${rcpt.blockNumber}`);
      await refreshEvents();
    } catch (err) {
      setStatus(err?.message || String(err));
    }
  }

  useEffect(() => { if (contract) refreshEvents(); }, [contract]);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 16, maxWidth: 900, margin: '0 auto' }}>
      <h1>Event Ticketing DApp (Sepolia)</h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={connectWallet} style={{ padding: '10px 14px' }}>
          {account ? 'Connected' : 'Connect Wallet'}
        </button>
        <div><b>Account:</b> {account || 'Not connected'}</div>
      </div>

      <p style={{ marginTop: 10 }}><b>Status:</b> {status || '-'}</p>

      <hr />

      <h2>Available Events</h2>
      {events.length === 0 ? <p>No events found. (Create via owner + deploy script or call createEvent in console)</p> : (
        <ul>
          {events.map(e => (
            <li key={e.id}>
              <b>#{e.id}</b> {e.name} — {e.minted}/{e.max} minted — Price: {formatEth(e.priceWei)} ETH
            </li>
          ))}
        </ul>
      )}

      <h2>Buy Ticket</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
        <label>
          Event ID:
          <input type="number" value={eventId} onChange={e => setEventId(Number(e.target.value))} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Token URI:
          <input value={tokenUri} onChange={e => setTokenUri(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </label>
        <button onClick={buyTicket} style={{ padding: '10px 14px' }}>
          Mint Ticket (payable)
        </button>
      </div>

      <p style={{ marginTop: 14, fontSize: 13, opacity: 0.85 }}>
        Configure contract address via <code>.env</code> in <code>client/</code>: <code>VITE_CONTRACT_ADDRESS=0x...</code>
      </p>
    </div>
  );
}
