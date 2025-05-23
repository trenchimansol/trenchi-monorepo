import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  Link,
  VStack,
  Heading,
  useColorModeValue,
  Spinner,
  Center,
  HStack,
  keyframes,
  Button,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../config/api';
import { useWallet } from '@solana/wallet-adapter-react';

const rankChangeAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  50% { transform: translateY(-10px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
`;

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [previousRanks, setPreviousRanks] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rankChangeStyle = {
    animation: `${rankChangeAnimation} 0.5s ease-out`,
    display: 'inline-block'
  };
  const { publicKey } = useWallet();

  const fetchLeaderboard = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Store previous ranks
      const prevRanks = {};
      leaderboardData.forEach((user, index) => {
        prevRanks[user.walletAddress] = index + 1;
      });
      setPreviousRanks(prevRanks);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const response = await fetch(
          `${api.leaderboard}${publicKey ? `?userWallet=${publicKey.toString()}` : ''}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Only retry on server errors or network issues
          if ((response.status >= 500 || response.status === 0) && retryCount < 3) {
            setIsLoading(false);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return fetchLeaderboard(retryCount + 1);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid leaderboard data format');
        }

        setLeaderboardData(data);
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message);
      setLeaderboardData([]);
      
      // Only create profile if we get a specific 404
      if (error.message.includes('404') && publicKey) {
        try {
          const createResponse = await fetch(`${api.profile}/${publicKey.toString()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              walletAddress: publicKey.toString(),
              name: `User ${publicKey.toString().slice(0, 4)}`,
              matchCount: 0,
              matchPoints: 0,
              referralCount: 0,
              referralPoints: 0,
              totalPoints: 0
            })
          });

          if (createResponse.ok) {
            // Retry fetching the leaderboard after creating the profile
            fetchLeaderboard();
          }
        } catch (createError) {
          console.error('Error creating profile:', createError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchLeaderboard();
      } catch (error) {
        console.error('Error in initial leaderboard fetch:', error);
      }
    };
    fetchData();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 900000); // 15 minutes

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navigation />
      <Container maxW="container.xl" py={4} px={{ base: 2, md: 8 }}>
        <VStack spacing={8} align="stretch">
          <Heading
            textAlign="center"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="bold"
          >
            Top 20 Trenchers
          </Heading>
          <Text 
            color="gray.600" 
            _dark={{ color: 'gray.400' }} 
            textAlign="center"
            fontSize={{ base: 'sm', md: 'md' }}
            px={2}
          >
            Our most active users ranked by matches and referrals
          </Text>

          {isLoading ? (
            <Center py={20}>
              <Spinner size="xl" color="purple.500" />
            </Center>
          ) : error ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Text color="red.500">{error}</Text>
                <Button colorScheme="purple" onClick={fetchLeaderboard}>
                  Try Again
                </Button>
              </VStack>
            </Center>
          ) : (
            <Box 
              overflowX="auto" 
              borderWidth="1px" 
              borderColor={borderColor} 
              borderRadius="lg"
              sx={{
                '::-webkit-scrollbar': {
                  height: '8px',
                  borderRadius: '8px',
                  backgroundColor: `rgba(0, 0, 0, 0.05)`,
                },
                '::-webkit-scrollbar-thumb': {
                  borderRadius: '8px',
                  backgroundColor: `rgba(0, 0, 0, 0.1)`,
                },
              }}
            >
              <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
                <Thead>
                  <Tr>
                    <Th fontSize={{ base: 'xs', md: 'sm' }}>Rank</Th>
                    <Th fontSize={{ base: 'xs', md: 'sm' }}>Profile</Th>
                    <Th isNumeric fontSize={{ base: 'xs', md: 'sm' }}>Matches</Th>
                    <Th isNumeric fontSize={{ base: 'xs', md: 'sm' }}>Refs</Th>
                    <Th isNumeric fontSize={{ base: 'xs', md: 'sm' }}>Points</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Array.isArray(leaderboardData) && leaderboardData.map((user, index) => {
                    const prevRank = previousRanks[user.walletAddress] || index + 1;
                    const rankChange = prevRank - (index + 1);
                    const isCurrentUser = user.walletAddress === publicKey?.toString();

                    return (
                      <Tr 
                        key={user.walletAddress}
                        bg={isCurrentUser ? 'purple.50' : undefined}
                        _dark={{ bg: isCurrentUser ? 'purple.900' : undefined }}
                        transition="all 0.2s"
                      >
                        <Td fontWeight="bold">
                          <HStack spacing={2}>
                            <Text>{index + 1}</Text>
                            {rankChange !== 0 && (
                              <Text
                                color={rankChange > 0 ? 'green.500' : 'red.500'}
                                fontSize="sm"
                                sx={rankChangeStyle}
                              >
                                {rankChange > 0 ? '↑' : '↓'}
                                {Math.abs(rankChange)}
                              </Text>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Link
                            as={RouterLink}
                            to={`/profile/${user.walletAddress}`}
                            display="flex"
                            alignItems="center"
                            gap={3}
                          >
                            <Image
                              src={user.profileImage || 'https://via.placeholder.com/40'}
                              alt={user.name || user.walletAddress.slice(0, 6)}
                              boxSize={{ base: '32px', md: '40px' }}
                              borderRadius="full"
                              objectFit="cover"
                            />
                            <Text fontSize={{ base: 'sm', md: 'md' }}>{user.name || user.walletAddress.slice(0, 6)}</Text>
                          </Link>
                        </Td>
                        <Td isNumeric>{user.matchCount || 0}</Td>
                        <Td isNumeric>{user.referralCount || 0}</Td>
                        <Td isNumeric fontWeight="bold" color="purple.500">
                          {(user.totalPoints || 0).toFixed(2)}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
