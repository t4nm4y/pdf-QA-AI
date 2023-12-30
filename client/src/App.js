import './App.css';
import Header from './components/Header';
import Main from './components/Main'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <div>
        <Toaster position="top-center"></Toaster>
    </div>
    <Header/>
    <Main/>
    </>
  );
}

export default App;
