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

  const fetchLeaderboard = useCallback(async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // Store previous ranks
      const prevRanks = {};
      leaderboardData.forEach((user, index) => {
        prevRanks[user.walletAddress] = index + 1;
      });
      setPreviousRanks(prevRanks);

      const response = await fetch(
        `${api.leaderboard}${publicKey ? `?userWallet=${publicKey.toString()}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json();

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid leaderboard data format');
      }

      // Filter out any invalid entries
      const validLeaderboard = data.filter(user => 
        user && typeof user === 'object' && 
        user.walletAddress
      ).map(user => ({
        ...user,
        name: user.name || user.walletAddress.slice(0, 6)
      }));

      setLeaderboardData(validLeaderboard);
      // User rank and data will come from the profile component
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message);
      setLeaderboardData([]);

      
      // If it's a 404 for the user's profile, create an empty one
      if (error.message.includes('profile not found') && publicKey) {
        try {
          const createResponse = await fetch(api.createProfile(publicKey.toString()), {
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
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 900000); // 15 minutes

    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="purple.500" />
          </Center>
        ) : error ? (
          <Center py={10}>
            <VStack spacing={4}>
              <Text color="red.500">{error}</Text>
              <Button colorScheme="purple" onClick={fetchLeaderboard}>
                Try Again
              </Button>
            </VStack>
          </Center>
        ) : (
          <Navigation />
        )}
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navigation />
      <Container maxW="container.xl" py={20}>
        <VStack spacing={8} align="stretch">
          <Heading
            textAlign="center"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            fontSize="4xl"
            fontWeight="bold"
          >
            Top 20 Trenchers
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
            Our most active users ranked by matches and referrals
          </Text>

          <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="lg">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Profile</Th>
                  <Th isNumeric>Matches (2PTS)</Th>
                  <Th isNumeric>Referrals (0.25PTS)</Th>
                  <Th isNumeric>Total Points</Th>
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
                            alt={user.name}
                            boxSize="40px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                          <Text>{user.name}</Text>
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
        </VStack>
      </Container>
    </Box>
  );
}
