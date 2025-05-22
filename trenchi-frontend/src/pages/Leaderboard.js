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
  const [userRank, setUserRank] = useState(null);
  const [userData, setUserData] = useState(null);
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
    try {
      setIsLoading(true);
      setError(null);
      
      // Store previous ranks before updating
      const prevRanks = leaderboardData.reduce((acc, user, index) => {
        acc[user.walletAddress] = index + 1;
        return acc;
      }, {});
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
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json();
      if (data && Array.isArray(data.leaderboard)) {
        setLeaderboardData(data.leaderboard);
        setUserRank(data.userRank);
        setUserData(data.userData);
      } else {
        throw new Error('Invalid leaderboard data format');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message);
      setLeaderboardData([]);
      setUserRank(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, leaderboardData]);

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
                {userData && (
                  <>
                    <Tr>
                      <Td colSpan={7} py={2} bg="gray.50" _dark={{ bg: 'gray.700' }}>
                        <Center>
                          <Text color="gray.500">...</Text>
                        </Center>
                      </Td>
                    </Tr>
                    <Tr bg="purple.50" _dark={{ bg: 'purple.900' }}>
                      <Td fontWeight="bold">{userRank}</Td>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/profile/${userData.walletAddress}`}
                          display="flex"
                          alignItems="center"
                          gap={3}
                        >
                          <Image
                            src={userData.profileImage || 'https://via.placeholder.com/40'}
                            alt={userData.name}
                            boxSize="40px"
                            borderRadius="full"
                            objectFit="cover"
                          />
                          <Text>{userData.name}</Text>
                        </Link>
                      </Td>
                      <Td isNumeric>{userData.matchCount || 0}</Td>
                      <Td isNumeric>{userData.referralCount || 0}</Td>
                      <Td isNumeric fontWeight="bold" color="purple.500">
                        {(userData.totalPoints || 0).toFixed(2)}
                      </Td>
                    </Tr>
                  </>
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
