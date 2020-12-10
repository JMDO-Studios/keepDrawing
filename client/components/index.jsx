import React, { Component } from 'react';
import Lobby from './Lobby';


// export default class App extends Component {
//   render(){
//     const {socket} = this.props;
      
//       <Lobby socket={socket} />
    
//   }
// }

// export default class App extends Component{
//   constructor(props){
//     super(props)
//     this.state = {
//       name: ''
//     }
//   }
//   componentDidMount(){
//     const {socket} = this.props;
//     this.setState({name: socket.name})
//   }
  
//   render(){
//     const{socket} = this.props;
//     console.log('cidx ', this.socket);
    
//     return (
//       <div>
//         {/* {this.state.name  ? <Waitingroom socket={socket}/> : <Lobby socket={socket}/>} */}
//         {/* {this.state.name && <Waitingroom socket={socket}/>} */}
//         {!this.state.name && <Lobby socket={socket}/>}
//       </div>
//     )
//   }
// }







// export default class Routes extends Component {
//   render() {
//     return (
//       <Router>
//         <Header />
//         <Switch>
//           <Route
//             exact
//             path="/"
//             render={(props) => <Lobby {...props} socket={socket} />}
//           />
//           <Route
//             exact
//             path="/waitingroom"
//             render={(props) => <Waitingroom {...props} socket={socket} />}
//           />
//           <Route
//             exact
//             path="/imagegame"
//             render={(props) => <DrawingGame {...props} socket={socket} />}
//           />
//         </Switch>
//         <Footer />
//       </Router>
//     );
//   }
// }
