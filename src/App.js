import './App.css';
import ChatPage from './Page/ChatPage';
import HomePage from './Page/HomePage';
import { Route} from 'react-router-dom';

function App() {
  return (
    <div className="App">
        <Route path="/" component={HomePage} exact/>
        <Route path="/chats" component={ChatPage} />
    </div>
  );
}

export default App;
