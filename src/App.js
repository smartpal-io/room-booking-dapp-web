import React, { Component } from 'react'
import { default as contract } from 'truffle-contract';
import RoomBookingServiceArtifacts from '../node_modules/open-smartkit/build/contracts/RoomBookingService.json'
let RoomBookingService = contract(RoomBookingServiceArtifacts)
import getWeb3 from './utils/getWeb3'


import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      roomBookingService: null,
      inputRoomId: '',
      web3: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

    })
    .catch(() => {
      console.log('Error finding web3.')
    })

    RoomBookingService.setProvider(this.state.web3.currentProvider);
    RoomBookingService.deployed().then(function(contractInstance){
      this.setState({
        roomBookingService: contractInstance
      })
    });
  }

  /**** VIEW *****/

  render() {

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <h1>Room Booking</h1>
          <h2>Ultimate booking service running on blockchain</h2>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              {this.renderFormRoomManagement()}
            </div>
          </div>
        </main>
      </div>
    );
  }

  renderFormRoomManagement = () => {
    return <form onSubmit={this.handleSubmit}>
      <label>
        Room ID : &nbsp; <input type="text" name="inputRoomId" value={this.state.inputRoomId} onChange={this.handleRoomInformationChange.bind(this)}/>
      </label>
      <button onClick={this.addRoomAction.bind(this)}>Add</button>
    </form>
  }


  /**** COMMON ACTION ****/

  handleSubmit(event) {
    event.preventDefault();
  }


  /**** ROOM INFORMATION ACTION ****/

  handleRoomInformationChange(event) {
    this.setState({
      inputRoomId: event.target.value,
    })
  }

  addRoomAction(event) {
    var inputRoomId = this.state.inputRoomId;
    console.log("inputRoomId : ", inputRoomId);

  }

}

export default App
