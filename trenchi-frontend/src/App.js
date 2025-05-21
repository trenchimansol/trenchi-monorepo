import React from 'react';
import { ChakraProvider, Box, Flex } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';

import Home from './pages/Home';
import Matching from './pages/Matching';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Pricing from './pages/Pricing';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <ChakraProvider>
      <Web3Provider>
        <Router>
          <Flex direction="column" minH="100vh">
            <Navigation />
            <Box flex="1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/matches" element={<Matching />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/pricing" element={<Pricing />} />
              </Routes>
            </Box>
            <Footer />
          </Flex>
        </Router>
      </Web3Provider>
    </ChakraProvider>
  );
}

export default App;
