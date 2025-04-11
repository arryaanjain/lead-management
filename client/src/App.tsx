import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Form from './components/Form';
import StatusHandler from './components/StatusHandler';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/status" element={<StatusHandler />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
