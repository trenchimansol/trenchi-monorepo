import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getConversations, getChatHistory, sendMessage } from '../api/messages';
import { InfoIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { FiSend } from 'react-icons/fi';
import Navigation from '../components/Navigation';

import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  AvatarBadge,
  useColorModeValue,
  Button,
  Badge,
  Flex,
  Heading,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function Messages() {
  const { publicKey } = useWallet();
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const messagesEndRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !publicKey || !selectedMatch) return;

    try {
      const message = await sendMessage(
        publicKey.toString(),
        selectedMatch.walletAddress,
        newMessage
      );

      setMessages(prev => [...prev, {
        id: message._id,
        sender: 'me',
        content: message.content,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSelectMatch = async (match) => {
    setSelectedMatch(match);
    try {
      const history = await getChatHistory(publicKey.toString(), match.walletAddress);
      const formattedMessages = history.map(msg => ({
        id: msg._id,
        sender: msg.senderId === publicKey.toString() ? 'me' : 'other',
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewProfile = () => {
    if (selectedMatch) {
      setShowProfile(true);
      onOpen();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;

      try {
        const conversations = await getConversations(publicKey.toString());
        const matchesWithProfiles = await Promise.all(
          conversations.map(async (conv) => {
            // Fetch user profile for each conversation
            const userProfile = await axios.get(`${API_BASE_URL}/api/users/${conv.walletAddress}`);
            return {
              id: conv.walletAddress,
              name: conv.name,
              lastMessage: conv.lastMessage,
              time: new Date(conv.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
              avatar: conv.avatar,
              unread: conv.unreadCount,
              profile: userProfile.data,
              walletAddress: conv.walletAddress
            };
          })
        );

        setMatches(matchesWithProfiles);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches and messages',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
  }, [publicKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Navigation />
      <Box p={4} pt={20}>
        <Grid
          templateColumns={{ base: '1fr', md: '300px 1fr' }}
          gap={4}
          maxW="1200px"
          mx="auto"
        >
          <GridItem
            borderRight={{ base: 'none', md: '1px solid' }}
            borderColor={borderColor}
            display={{ base: selectedMatch ? 'none' : 'block', md: 'block' }}
          >
            <VStack spacing={0} align="stretch">
              <Heading size="md" mb={4} p={4}>
                Messages
              </Heading>
              {matches.map(match => (
                <Box
                  key={match.id}
                  p={4}
                  cursor="pointer"
                  onClick={() => handleSelectMatch(match)}
                  bg={selectedMatch && selectedMatch.id === match.id ? selectedBg : bgColor}
                  _hover={{ bg: !selectedMatch || selectedMatch.id !== match.id ? hoverBg : undefined }}
                  transition="all 0.2s"
                  borderBottom="1px solid"
                  borderColor={borderColor}
                >
                  <HStack spacing={4}>
                    <Avatar src={match.avatar} name={match.name}>
                      {match.unread > 0 && (
                        <AvatarBadge boxSize="1.25em" bg="green.500">
                          <Text fontSize="xs" color="white">
                            {match.unread}
                          </Text>
                        </AvatarBadge>
                      )}
                    </Avatar>
                    <Box flex="1">
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{match.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {match.time}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {match.lastMessage}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </GridItem>

          <GridItem display={{ base: selectedMatch ? 'block' : 'none', md: 'block' }}>
            {selectedMatch ? (
              <Box position="relative" h="calc(100vh - 160px)">
                <HStack justify="space-between" align="center" w="full" p={4} borderBottom="1px solid" borderColor={borderColor} bg={bgColor}>
                  <HStack spacing={4}>
                    <IconButton
                      icon={<ArrowBackIcon />}
                      variant="ghost"
                      onClick={() => setSelectedMatch(null)}
                      display={{ base: 'inline-flex', md: 'none' }}
                    />
                    <Avatar src={selectedMatch.avatar} name={selectedMatch.name}>
                      <AvatarBadge boxSize="1em" bg="green.500" />
                    </Avatar>
                    <Text fontWeight="bold">{selectedMatch.name}</Text>
                  </HStack>
                  <IconButton
                    icon={<InfoIcon />}
                    variant="ghost"
                    onClick={handleViewProfile}
                    aria-label="View profile"
                  />
                </HStack>

                <Box 
                  overflowY="auto" 
                  h="calc(100vh - 280px)"
                  p={4}
                >
                  <VStack spacing={4} align="stretch">
                    {messages.map(message => (
                      <HStack
                        key={message.id}
                        alignSelf={message.sender === 'me' ? 'flex-end' : 'flex-start'}
                        maxW="70%"
                      >
                        {message.sender !== 'me' && (
                          <Avatar
                            size="sm"
                            src={selectedMatch.avatar}
                            name={selectedMatch.name}
                          />
                        )}
                        <Box>
                          <Box
                            bg={message.sender === 'me' ? 'blue.500' : bgColor}
                            color={message.sender === 'me' ? 'white' : undefined}
                            px={4}
                            py={2}
                            borderRadius="lg"
                            boxShadow="sm"
                          >
                            <Text>{message.content}</Text>
                          </Box>
                          <Text fontSize="xs" color="gray.500" textAlign={message.sender === 'me' ? 'right' : 'left'}>
                            {message.timestamp}
                          </Text>
                        </Box>
                      </HStack>
                    ))}
                    <div ref={messagesEndRef} />
                  </VStack>
                </Box>

                <Box 
                  position="absolute" 
                  bottom={0} 
                  left={0} 
                  right={0} 
                  p={4} 
                  borderTop="1px solid" 
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <HStack>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      bg={inputBgColor}
                      borderRadius="full"
                      pl={6}
                      _focus={{ boxShadow: 'none', borderColor: 'blue.400' }}
                    />
                    <IconButton
                      icon={<FiSend />}
                      colorScheme="blue"
                      aria-label="Send message"
                      isDisabled={!newMessage.trim()}
                      rounded="full"
                      onClick={handleSendMessage}
                    />
                  </HStack>
                </Box>
              </Box>
            ) : (
              <VStack justify="center" h="full" p={4} spacing={4}>
                <Text color="gray.500">Select a conversation to start messaging</Text>
              </VStack>
            )}
          </GridItem>
        </Grid>
      </Box>

      <Drawer 
        isOpen={isOpen} 
        onClose={() => {
          onClose();
          setShowProfile(false);
        }} 
        size="md" 
        placement="right"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Profile Details</DrawerHeader>
          <DrawerBody>
            {selectedMatch && showProfile && (
              <Box p={4}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="lg" mb={2}>{selectedMatch.name}</Heading>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue">{selectedMatch.profile.age} years</Badge>
                      <Badge colorScheme="purple">{selectedMatch.profile.gender}</Badge>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold" mb={2}>About</Text>
                    <Text>{selectedMatch.profile.bio}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Photos</Text>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      {selectedMatch.profile.photos.map((photo, index) => (
                        <Box 
                          key={index} 
                          borderRadius="lg" 
                          overflow="hidden"
                          position="relative"
                          paddingBottom="100%"
                        >
                          <Box
                            as="img"
                            src={photo}
                            position="absolute"
                            top={0}
                            left={0}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                      ))}
                    </Grid>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Looking For</Text>
                    <Text>{selectedMatch.profile.seeking}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Crypto Interests</Text>
                    <Text>{selectedMatch.profile.cryptoInterests}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Favorite Chains</Text>
                    <Text>{selectedMatch.profile.favoriteChains}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>Wallet</Text>
                    <VStack align="start" spacing={1}>
                      <Badge colorScheme="purple">{selectedMatch.profile.walletBalance} SOL</Badge>
                      <Text fontSize="sm" color="gray.500">
                        {selectedMatch.profile.walletAddress ? 
                          `${selectedMatch.profile.walletAddress.slice(0, 4)}...${selectedMatch.profile.walletAddress.slice(-4)}` : 
                          'Not connected'}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
