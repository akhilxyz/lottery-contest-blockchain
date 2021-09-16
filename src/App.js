import "./App.css";
// import web3 from './web3';
import React, { Component } from "react";
import Web3 from "web3";
import web3 from "./web3";
import lottery from "./lottery";

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      address: null,
      manager: null,
      players: [],
      balance: "",
      fees: "",
      error: false,
      errorPickWinner: false,
      errorBalance: false,
      message: "",
      WinnerMessage: "",
    };
  }

  // **************** ON CHANGE FUNCTION *******************

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
    this.setState({ error: false });
  };
  // detect Account connect with metamask

  // **************** GET ETH ACCOUNT INFO FUNCTION *******************

  getAccounts() {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        console.log(error);
      } else {
        this.setState({ address: result[0] });
      }
    });
  }

  // **************** PICK WINNER FUNCTION ***************************

  pickWinner = async (e) => {
    e.preventDefault();
    this.setState({ error: false });
    if (this.state.address !== this.state.manager) {
      return this.setState({ errorPickWinner: true });
    } else if (this.state.balance === "0") {
      return this.setState({ errorBalance: true });
    } else {
      this.setState({ WinnerMessage: "please wait..." });
      await lottery.methods.pickWinner().send({
        from: this.state.manager,
      });
      this.setState({ WinnerMessage: "A winner has been picked !" });
    }
  };

  // ****************** ON ENTER FUNCTION ****************************

  onEnter = async (e) => {
    e.preventDefault();
    if (this.state.fees !== "1") {
      return this.setState({ error: true });
    } else {
      this.setState({ message: "your transaction is in process.." });

      // console.log("fees :" , web3.utils.fromWei(this.state.fees, 'ether'))
      let value = web3.utils.toWei(this.state.fees, "ether");
     let rs =  await lottery.methods
        .enter()
        .send({ from: this.state.address, value: value }).then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });;

      if (rs === undefined) {
        return this.setState({ message: "Opps... Something went wrong !" });
      }
      else {
        this.setState({ message: "your transaction is Completed Successfully" });
        this.getContractDetails();
      }
    }
  };

  // ************************ GET CONTRACT DETAILS FUNCTION *************************

  getContractDetails = async () => {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.playerRecord().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
  };

  // ************************** COMPONENT-DID-MOUNT*************************************

  async componentDidMount() {
    this.getAccounts();
    this.getContractDetails();
  }

  // ********************** RENDER FUNTION *********************************************
  render() {

    // Connecting with metamask extention
    if (window.ethereum) {
      new Web3(window.ethereum);
      try {
        window.ethereum.enable().then(function () {
          // User has allowed account access to DApp...
        });
      } catch (e) {
        // User has denied account access to DApp...
      }
      window.ethereum.on("accountsChanged", function (accounts) {});
    }
    // Legacy DApp Browsers
    else if (window.web3) {
      new Web3(window.web3.currentProvider);
      window.location.reload();
    }
    // Non-DApp Browsers
    else {
      alert("You have to install MetaMask !");
    }

    // error handeling
    let errMsg;
    let errPickWinner;
    let errorBalance;

    if (this.state.error) {
      errMsg = (
        <span style={{ color: "red" }}>
          Please enter Valid amount of 1 ether
        </span>
      );
    }
    if (this.state.errorPickWinner) {
      errPickWinner = (
        <span style={{ color: "red" }}>Sorry you are not onwer</span>
      );
    }
    if (this.state.errorBalance) {
      errorBalance = <span style={{ color: "red" }}>Insufficient Balance</span>;
    }

    // ************************** JSX *************************************

    return (
      <div className="App">
        <div class="alert alert-primary" role="alert">
          <h1>Lottery</h1>
          <h4>
            Contract is Managed by :{" "}
            <span style={{ color: "green" }}> {this.state.manager} </span>
          </h4>
        </div>
        {this.state.address !== null ? (
          <>
            <div style={{ marginTop: "40px" }}>
              <h5 style={{ color: "red" }}>
                Your Account:{" "}
                <span style={{ color: "blue" }}>{this.state.address}</span>
              </h5>
            </div>
            <div>
              <p>
                There are currently {this.state.players.length} players entered
                competing for {web3.utils.fromWei(this.state.balance, "ether")}{" "}
                ether
              </p>
            </div>
            <input
              placeholder="1 ether.."
              value={this.state.fees}
              name="fees"
              onChange={this.onChange}
            />
            <br />
            {errMsg} <br />
            <button
              className="btn btn-primary"
              style={{ margin: "20px" }}
              onClick={this.onEnter}
            >
              Enter to Lottery
            </button>
            <h5 style={{color : "blue"}}>{this.state.message}</h5>
            <br />
            <h5>Pick A Winner</h5>
            <button className="btn btn-success" onClick={this.pickWinner}>
              Enter
            </button>
            <br />
            <div style={{ marginTop: "10px" }}>
              {errPickWinner} {errorBalance}
            </div>
            <h5>{this.state.WinnerMessage}</h5>
          </>
        ) : (
          <>
            <h3 style={{ color: "red" }}>Oops.. No Account Found</h3>
            <h4>
              install{" "}
              <a
                style={{ color: "red" }}
                href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en"
              >
                MetaMask
              </a>{" "}
              and try again
            </h4>
          </>
        )}
      </div>
    );
  }
}
