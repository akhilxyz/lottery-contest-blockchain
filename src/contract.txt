// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// A contract in the sense of Solidity is a collection of code (its functions) and data (its state)
// that resides at a specific address on the Ethereum blockchain.

contract Lottery{
    address public manager; // address of manager of the contract
    address[] public players; // list of entered account
     constructor() {
        manager = msg.sender;
    }

    // The function body is inserted where the special symbol "_;" appears in the definition of a modifier.
    // So if condition of modifier is satisfied while calling this function, the function is executed and otherwise, an exception is thrown.
    modifier restricted() {
        require(msg.sender == manager,"Lottery: Msg.sender is not manager");
        _;
    }

    // this function will return the address of palyers entered in lottery contest
    function playerRecord() public view returns (address[] memory){
        return  players;
    }

    // this function will takes the gas fees from the players
    function enter() public payable{
        require(msg.value == 1 ether, "Lottery: enter amount value should be 1 ether");
        players.push(msg.sender);
    }

    //this fuction will generate the random number
     function random() private view returns (uint) {
        // sha3 and now have been deprecated
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
        // convert hash to integer
        // players is an array of entrants
    }
    // this function will pick the winner from random number
    function pickWinner() public restricted{
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        delete players;
    }

    // this function will check the balance of the contract
    function checkBalance() public view returns(uint) {
        return address(this).balance ;
    }
}