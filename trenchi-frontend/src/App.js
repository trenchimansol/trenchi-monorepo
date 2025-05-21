import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';

import Navigation from './components/Navigation';
import Matching from './pages/Matching';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Pricing from './pages/Pricing';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <ChakraProvider>
      <Web3Provider>
        <Router>
          <Box minH="100vh">
            <Navigation />
            <Routes>
              <Route path="/profile" element={<Profile />} />
              <Route path="/" element={<Matching />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </Box>
        </Router>
      </Web3Provider>
    </ChakraProvider>
  );
}

export default App;
