import React, { useState, useEffect } from 'react';
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
  Center
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../config/api';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${api.baseURL}/api/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Set up 15-minute refresh interval
    const refreshInterval = setInterval(fetchLeaderboard, 15 * 60 * 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Navigation />
        <Center h="50vh">
          <Spinner size="xl" color="purple.500" />
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navigation />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading
            textAlign="center"
            bgGradient="linear(to-r, purple.400, pink.400)"
            bgClip="text"
            fontSize="4xl"
            fontWeight="bold"
          >
            Trenchi Leaderboard
          </Heading>

          <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="lg">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Profile</Th>
                  <Th isNumeric>Matches</Th>
                  <Th isNumeric>Referrals</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboardData.map((user, index) => (
                  <Tr key={user.walletAddress}>
                    <Td fontWeight="bold">{index + 1}</Td>
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
                    <Td isNumeric>{user.matchCount}</Td>
                    <Td isNumeric>{user.referralCount}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
