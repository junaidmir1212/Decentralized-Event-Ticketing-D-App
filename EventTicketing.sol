// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EventTicketing
 * @notice Simple decentralised event ticketing: each ticket is an ERC-721 NFT.
 * @dev Designed for teaching/demo on Ethereum test networks (e.g., Sepolia).
 */
contract EventTicketing is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public nextTokenId;
    uint256 public nextEventId;

    struct EventInfo {
        string name;
        uint256 maxTickets;
        uint256 priceWei;
        uint256 minted;
        bool exists;
    }

    // eventId => EventInfo
    mapping(uint256 => EventInfo) public events;

    // tokenId => eventId
    mapping(uint256 => uint256) public ticketEvent;

    event EventCreated(uint256 indexed eventId, string name, uint256 maxTickets, uint256 priceWei);
    event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed owner);
    event TicketVerified(uint256 indexed eventId, uint256 indexed tokenId, address indexed owner);

    constructor() ERC721("EventTicket", "ETIX") {}

    /**
     * @notice Create an event (organiser action).
     */
    function createEvent(string calldata name, uint256 maxTickets, uint256 priceWei) external onlyOwner {
        require(bytes(name).length > 0, "name required");
        require(maxTickets > 0, "maxTickets>0");

        uint256 eventId = nextEventId++;
        events[eventId] = EventInfo({
            name: name,
            maxTickets: maxTickets,
            priceWei: priceWei,
            minted: 0,
            exists: true
        });

        emit EventCreated(eventId, name, maxTickets, priceWei);
    }

    /**
     * @notice Mint a ticket NFT for a given event (buyer action).
     * @param eventId The event identifier.
     * @param tokenURI Metadata URI (e.g., ipfs://... or https://...).
     */
    function mintTicket(uint256 eventId, string calldata tokenURI) external payable nonReentrant returns (uint256) {
        EventInfo storage e = events[eventId];
        require(e.exists, "event not found");
        require(e.minted < e.maxTickets, "sold out");
        require(msg.value >= e.priceWei, "insufficient payment");

        uint256 tokenId = nextTokenId++;
        e.minted += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        ticketEvent[tokenId] = eventId;

        emit TicketMinted(eventId, tokenId, msg.sender);
        return tokenId;
    }

    /**
     * @notice Verify ticket ownership for an event (e.g., gate check).
     */
    function verifyTicket(uint256 tokenId, uint256 eventId) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        if (ticketEvent[tokenId] != eventId) return false;
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Owner withdraws contract balance (event organiser revenue).
     */
    function withdraw() external onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}
