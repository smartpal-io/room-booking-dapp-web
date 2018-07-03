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
      inputRoomId: '',
      inputContractAddress: '',
      inputFrom: '',
      inputUntil: '',
      inputCapacity: '',
      inputSlot: '',
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


  }

  /**** VIEW *****/

  render() {

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <h1>Bookchain</h1>
          <h2>Ultimate booking service running on blockchain</h2>
        </nav>


        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
                <h2> Manage bookings from one place </h2>
            </div>
          </div>
          <div className="pure-g">
            <div className="pure-u-1-1">
              {this.renderFormConfiguration()}
            </div>
            <div className="pure-u-1-1">
              {this.renderFormRoomManagement()}
            </div>
          </div>
        </main>


      </div>
    );
  }

  renderFormConfiguration = () => {
    return <form onSubmit={this.handleSubmit}>
      <label>
        Contract address  &nbsp; <input type="text" name="inputContractAddress" value={this.state.inputContractAddress} onChange={this.handleStateChange.bind(this)}/>
      </label>
    </form>
  }

  renderFormRoomManagement = () => {
    return <form onSubmit={this.handleSubmit}>
      <label>
        Room ID  &nbsp; <input type="text" name="inputRoomId" value={this.state.inputRoomId} onChange={this.handleStateChange.bind(this)}/>
      </label>
      <label>
        Capacity  &nbsp; <input type="text" name="inputCapacity" value={this.state.inputCapacity} onChange={this.handleStateChange.bind(this)}/>
      </label>
      <button onClick={this.addRoomAction.bind(this)}>Add</button>
      <br />
      <label>
        From  &nbsp; <input type="text" name="inputFrom" value={this.state.inputFrom} onChange={this.handleStateChange.bind(this)}/>
      </label>
      <label>
        To  &nbsp; <input type="text" name="inputUntil" value={this.state.inputUntil} onChange={this.handleStateChange.bind(this)}/>
      </label>
      <button onClick={this.checkRoomAvailabilityAction.bind(this)}>Check Availability</button>
      <button onClick={this.bookRoomAction.bind(this)}>Book</button>
      <button onClick={this.freeRoomAction.bind(this)}>Free</button>

    </form>
  }


  /**** COMMON ACTION ****/

  handleSubmit(event) {
    event.preventDefault();
  }


  handleStateChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    })
  }


  addRoomAction(event) {
    var inputRoomId = this.state.inputRoomId;
    var inputCapacity = this.state.inputCapacity;
    console.log("inputRoomId : ", inputRoomId, " capacity : ", inputCapacity);
    RoomBookingService.setProvider(this.state.web3.currentProvider);
    var roomBookingService;
    this.state.web3.eth.getAccounts((error, accounts) => {
      RoomBookingService.at(this.state.inputContractAddress).then((instance) => {
        roomBookingService = instance
        return roomBookingService.addRoom(inputRoomId, inputCapacity,  {from: accounts[0]})
      })
    })
  }

  checkRoomAvailabilityAction(event) {
    RoomBookingService.setProvider(this.state.web3.currentProvider);
    var roomBookingService;
    this.state.web3.eth.getAccounts((error, accounts) => {
      RoomBookingService.at(this.state.inputContractAddress).then((instance) => {
        roomBookingService = instance
        return roomBookingService.isRoomAvailable(
          this.state.inputRoomId,
          this.state.inputFrom,
          this.state.inputUntil,
        ).then((result) => {
          console.log("isRoomAvailable : ", result);
        })
      })
    })
  }

  bookRoomAction(event) {
    RoomBookingService.setProvider(this.state.web3.currentProvider);
    var roomBookingService;
    this.state.web3.eth.getAccounts((error, accounts) => {
      RoomBookingService.at(this.state.inputContractAddress).then((instance) => {
        roomBookingService = instance
        return roomBookingService.book(
          this.state.inputRoomId,
          this.state.inputFrom,
          this.state.inputUntil,
          {from: accounts[0]}
        ).then((result) => {
            console.log("roomBookingService.book response received : ", result);
            this.listenRoomBookedEvent(roomBookingService);
        })
      })
    })
  }

  listenRoomBookedEvent(roomBookingService){
    console.log("starting watching LogRoomBooked")
    var event = roomBookingService.LogRoomBooked();
    event.watch((err, result) => {
            if (err) {
              console.log('could not get event LogRoomBooked()');
            } else {
              console.log("LogRoomBooked : ", result);
            }
            console.log("stoping watching LogRoomBooked event")
            event.stopWatching();

    })
  }

  freeRoomAction(event) {
    RoomBookingService.setProvider(this.state.web3.currentProvider);
    var roomBookingService;
    this.state.web3.eth.getAccounts((error, accounts) => {
      RoomBookingService.at(this.state.inputContractAddress).then((instance) => {
        roomBookingService = instance
        return roomBookingService.free(
          this.state.inputRoomId,
          this.state.inputFrom,
          this.state.inputUntil,
          {from: accounts[0]}
        )
      })
    })
  }

}

export default App
