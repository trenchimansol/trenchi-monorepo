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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${api.leaderboard}${publicKey ? `?userWallet=${publicKey.toString()}` : ''}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.warn('Invalid leaderboard data format, using empty array');
          if (isMounted) {
            setLeaderboardData([]);
          }
          return;
        }

        if (isMounted) {
          // Store previous ranks before updating data
          const prevRanks = {};
          leaderboardData.forEach((user, index) => {
            prevRanks[user.walletAddress] = index + 1;
          });
          setPreviousRanks(prevRanks);
          
          // Update leaderboard data
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        if (isMounted) {
          setError(error.message);
          setLeaderboardData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navigation />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box h="40px" /> {/* Spacer */}
          <Heading size="lg" textAlign="center" mb={8}>
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
                <Button colorScheme="purple" onClick={() => setIsLoading(true)}>
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
                              src={user.profileImage || '/default-avatar.png'}
                              alt={user.name || user.walletAddress.slice(0, 6)}
                              boxSize={{ base: '32px', md: '40px' }}
                              borderRadius="full"
                              objectFit="cover"
                              fallbackSrc="/default-avatar.png"
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
