import React, { Component } from 'react';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import './App.css';
import { default as contract } from 'truffle-contract';
import RoomBookingServiceArtifacts from '../node_modules/open-smartkit/build/contracts/RoomBookingService.json'
import getWeb3 from './utils/getWeb3'
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'

let RoomBookingService = contract(RoomBookingServiceArtifacts)

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

class App extends Component {
  constructor(props) {
    super(props)
    this.classes  = props;
    console.log(props);
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bookchain</h1>
        </header>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
                <h2> Manage bookings from one place </h2>
            </div>
          </div>
          <div className="pure-g">
            <div className="pure-u-1-1">
              {this.renderRoomForm()}
            </div>
          </div>
        </main>

      </div>
    );
  }


  renderRoomForm = () => {
    return <form onSubmit={this.handleSubmit}>

      <div className={this.classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={12} >
            <label>
              Contract address  &nbsp; <input type="text" name="inputContractAddress" value={this.state.inputContractAddress} onChange={this.handleStateChange.bind(this)}/>
              </label>
          </Grid>
          <Grid item xs={12} sm={12}>
            <label>
              Room ID  &nbsp; <input type="text" name="inputRoomId" value={this.state.inputRoomId} onChange={this.handleStateChange.bind(this)}/>
            </label>
            <label>
              Capacity  &nbsp; <input type="text" name="inputCapacity" value={this.state.inputCapacity} onChange={this.handleStateChange.bind(this)}/>
            </label>
            <label>
              From  &nbsp; <input type="text" name="inputFrom" value={this.state.inputFrom} onChange={this.handleStateChange.bind(this)}/>
            </label>
            <label>
              To  &nbsp; <input type="text" name="inputUntil" value={this.state.inputUntil} onChange={this.handleStateChange.bind(this)}/>
            </label>
            <label>
              Slot  &nbsp; <input type="text" name="inputSlot" value={this.state.inputSlot} onChange={this.handleStateChange.bind(this)}/>
            </label>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button color="primary" className={this.classes.button} onClick={this.addRoomAction.bind(this)}>Add</Button>
            <Button onClick={this.checkRoomAvailabilityAction.bind(this)}>Check Availability</Button>
            <Button color="primary" onClick={this.bookRoomAction.bind(this)}>Book</Button>
            <Button color="secondary" onClick={this.freeRoomAction.bind(this)}>Free</Button>
          </Grid>
        </Grid>
      </div>
    </form>
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
              var slot = result["args"]["slot"];
              console.log("Slot : ", slot.toNumber());
              this.setState({
                inputSlot: slot
              })
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
        console.log("invoking free with roomId : ", this.state.inputRoomId, " slot : ", this.state.inputSlot);

        return roomBookingService.free(
          this.state.inputRoomId,
          this.state.inputSlot.toNumber(),
          {from: accounts[0]}
        )
      })
    })
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleStateChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    })
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withStyles(styles)(App);
