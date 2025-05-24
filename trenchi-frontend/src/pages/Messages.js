import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getConversations, getChatHistory, sendMessage } from '../api/messages';
import { InfoIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { FiSend } from 'react-icons/fi';
import Navigation from '../components/Navigation';
import MatchCard from '../components/MatchCard';

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
  Image,
  Wrap,
  WrapItem,
  Heading,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const nextImage = () => {
    if (selectedMatch?.profile?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedMatch.profile.images.length);
    }
  };

  const prevImage = () => {
    if (selectedMatch?.profile?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedMatch.profile.images.length - 1 : prev - 1
      );
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    if (!publicKey) return;

    const fetchUserData = async () => {
      try {
        // First get all matched users
        const matchesResponse = await axios.get(`${API_BASE_URL}/api/matches/${publicKey.toString()}`);
        const matchedUsers = matchesResponse.data;

        // Then get conversations
        const conversations = await getConversations(publicKey.toString());

        // Combine matches with their conversations
        const matchesWithProfiles = await Promise.all(
          matchedUsers.map(async (match) => {
            // Find conversation with this match if it exists
            const conversation = conversations.find(conv => conv.walletAddress === match.walletAddress);
            
            return {
              id: match.walletAddress,
              name: match.name || 'Anonymous',
              walletAddress: match.walletAddress,
              avatar: match.images?.[0] || '',
              lastMessage: conversation?.lastMessage || '',
              time: conversation ? new Date(conversation.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
              unreadCount: conversation?.unreadCount || 0,
              profile: {
                age: match.age || null,
                gender: match.gender || null,
                bio: match.bio || '',
                location: match.location || null,
                interests: match.interests || [],
                favoriteChains: match.favoriteChains || [],
                images: match.images || [],
                portfolioValueSOL: match.portfolioValueSOL || 0
              }
            };
          })
        );

        setMatches(matchesWithProfiles);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matches',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [publicKey]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !publicKey || !selectedMatch) return;

    try {
      // Send the message
      const message = await sendMessage(
        publicKey.toString(),
        selectedMatch.walletAddress,
        newMessage
      );

      // Update messages list
      setMessages(prev => [...prev, {
        id: message._id,
        senderId: publicKey.toString(),
        content: message.content,
        timestamp: new Date(message.timestamp)
      }]);

      // Update the match's last message in the list
      setMatches(prev => prev.map(match => {
        if (match.id === selectedMatch.id) {
          return {
            ...match,
            lastMessage: newMessage,
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          };
        }
        return match;
      }));

      // Clear input
      setNewMessage('');
      
      // Scroll to bottom with smooth animation
      const chatBox = document.querySelector('.chat-messages');
      if (chatBox) {
        chatBox.scrollTo({
          top: chatBox.scrollHeight,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
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
        senderId: msg.senderId,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
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
    if (!selectedMatch?.profile) {
      toast({
        title: 'Error',
        description: 'Profile information not available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setShowProfile(true);
    onOpen();
  };

  useEffect(() => {
    const chatBox = document.querySelector('.chat-messages');
    if (chatBox) {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    }
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
          {/* Left side - Matched users list */}
          <GridItem
            borderRight={{ base: 'none', md: '1px solid' }}
            borderRightColor={borderColor}
            pr={{ base: 0, md: 4 }}
            overflowY="auto"
            h="full"
            bg={bgColor}
          >
            <VStack spacing={4} align="stretch">
              {matches.map((match) => (
                <Box
                  key={match.id}
                  p={4}
                  cursor="pointer"
                  bg={selectedMatch?.id === match.id ? selectedBg : bgColor}
                  _hover={{ bg: hoverBg }}
                  borderRadius="lg"
                  onClick={() => handleSelectMatch(match)}
                >
                  <HStack spacing={4}>
                    <Avatar size="md" name={match.name} src={match.avatar}>
                      {match.unreadCount > 0 && (
                        <AvatarBadge boxSize="1.25em" bg="green.500">
                          {match.unreadCount}
                        </AvatarBadge>
                      )}
                    </Avatar>
                    <Box flex="1">
                      <Text fontWeight="bold">{match.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {match.lastMessage || 'No messages yet'}
                      </Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {match.time}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
            {matches.length === 0 && (
              <VStack p={4} spacing={4} align="center">
                <Text color="gray.500">No matches yet</Text>
                <Button
                  as="a"
                  href="/matches"
                  colorScheme="blue"
                  size="sm"
                >
                  Find Matches
                </Button>
              </VStack>
            )}
          </GridItem>

          {/* Right side - Chat area */}
          <GridItem 
            display={{ base: selectedMatch ? 'block' : 'none', md: 'block' }}
            h="full"
            bg={bgColor}
          >
            {selectedMatch ? (
              <Box h="full" display="flex" flexDirection="column">
                {/* Chat header */}
                <HStack
                  p={4}
                  borderBottomWidth="1px"
                  borderColor={borderColor}
                  spacing={4}
                >
                  <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    icon={<ArrowBackIcon />}
                    variant="ghost"
                    onClick={() => setSelectedMatch(null)}
                  />
                  <Avatar size="sm" name={selectedMatch.name} src={selectedMatch.avatar} />
                  <Box flex="1">
                    <Text fontWeight="bold">{selectedMatch.name}</Text>
                  </Box>
                  <IconButton
                    icon={<InfoIcon />}
                    variant="ghost"
                    onClick={handleViewProfile}
                  />
                </HStack>

                {/* Messages area */}
                <Box
                  flex="1"
                  overflowY="auto"
                  p={4}
                  display="flex"
                  flexDirection="column"
                  className="chat-messages"
                >
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      alignSelf={message.senderId === publicKey?.toString() ? 'flex-end' : 'flex-start'}
                      maxW="70%"
                      mb={4}
                    >
                      <Box
                        bg={message.senderId === publicKey?.toString() ? 'blue.500' : bgColor}
                        color={message.senderId === publicKey?.toString() ? 'white' : 'inherit'}
                        borderRadius="lg"
                        px={4}
                        py={2}
                        borderWidth={message.senderId === publicKey?.toString() ? 0 : '1px'}
                      >
                        <Text>{message.content}</Text>
                      </Box>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Text>
                    </Box>
                  ))}
                </Box>

                {/* Input area */}
                <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
                  <form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        bg={inputBgColor}
                      />
                      <InputRightElement>
                        <IconButton
                          type="submit"
                          icon={<ArrowForwardIcon />}
                          colorScheme="blue"
                          variant="ghost"
                          isDisabled={!newMessage.trim()}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </form>
                </Box>
              </Box>
            ) : (
              <Box 
                h="full" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text color="gray.500">Select a match to start chatting</Text>
              </Box>
            )}
          </GridItem>
        </Grid>
      </Box>
      <Drawer
        isOpen={isOpen}
        onClose={() => { onClose(); setShowProfile(false); }}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0}>
            {showProfile && selectedMatch?.profile ? (
              <Box maxH="calc(100vh - 32px)" overflowY="auto" bg="gray.800">
                {/* Profile Image Slideshow */}
                <Box position="relative" w="100%" pb="133.33%" bg="gray.900">
                  <Image
                    src={selectedMatch.profile.images?.[currentImageIndex] || 'https://via.placeholder.com/400'}
                    alt={selectedMatch.name}
                    position="absolute"
                    top={0}
                    left={0}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="opacity 0.3s"
                  />
                  
                  {/* Navigation Arrows */}
                  {selectedMatch.profile.images?.length > 1 && (
                    <>
                      <IconButton
                        icon={<ArrowBackIcon />}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={prevImage}
                        colorScheme="whiteAlpha"
                        variant="ghost"
                        size="lg"
                        isRound
                        aria-label="Previous image"
                      />
                      <IconButton
                        icon={<ArrowForwardIcon />}
                        position="absolute"
                        right={4}
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={nextImage}
                        colorScheme="whiteAlpha"
                        variant="ghost"
                        size="lg"
                        isRound
                        aria-label="Next image"
                      />
                    </>
                  )}

                  {/* Image Counter */}
                  {selectedMatch.profile.images?.length > 1 && (
                    <HStack
                      position="absolute"
                      top={4}
                      left={4}
                      spacing={1}
                      p={2}
                      borderRadius="full"
                      bg="blackAlpha.600"
                    >
                      {selectedMatch.profile.images.map((_, index) => (
                        <Box
                          key={index}
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={index === currentImageIndex ? "white" : "whiteAlpha.400"}
                        />
                      ))}
                    </HStack>
                  )}

                  {/* Name and Info Overlay */}
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={4}
                    background="linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))">
                    <HStack align="center" spacing={2}>
                      <Text fontSize="2xl" fontWeight="bold" color="white">{selectedMatch.name}</Text>
                      <Text fontSize="2xl" color="whiteAlpha.800">{selectedMatch.profile.age}</Text>
                    </HStack>
                    <Badge colorScheme="purple" mt={1}>{selectedMatch.profile.gender}</Badge>
                  </Box>

                  {/* Wallet Tag */}
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme="purple"
                    fontSize="sm"
                    px={2}
                    py={1}
                  >
                    {selectedMatch.profile.tag || 'GM9S...CMJW'}
                  </Badge>
                </Box>

                {/* Profile Info */}
                <VStack spacing={6} p={6} align="start" w="100%">
                  <Text>{selectedMatch.profile.bio || 'Hello'}</Text>

                  <Box w="100%">
                    <Text color="blue.400" fontWeight="semibold" mb={2}>Portfolio Value</Text>
                    <Text fontSize="lg">{selectedMatch.profile.portfolioValueSOL} SOL</Text>
                  </Box>

                  <Box w="100%">
                    <Text color="blue.400" fontWeight="semibold" mb={2}>Interests</Text>
                    <Text color="gray.300">
                      {selectedMatch.profile.interests?.join(', ') || 'Trading Memes'}
                    </Text>
                  </Box>

                  <Box w="100%">
                    <Text color="blue.400" fontWeight="semibold" mb={2}>Favorite Chains</Text>
                    <Text color="gray.300">
                      {selectedMatch.profile.favoriteChains?.join(', ') || 'Solana'}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            ) : (
              <VStack h="100%" spacing={0}>
                <Box p={4} w="full" borderBottomWidth={1}>
                  <HStack spacing={4}>
                    <Avatar size="lg" name={selectedMatch?.name} src={selectedMatch?.avatar} />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold">{selectedMatch?.name}</Text>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => setShowProfile(true)}
                      >
                        View Profile
                      </Button>
                    </VStack>
                  </HStack>
                </Box>
                <Box
                  w="full"
                  h="calc(100vh - 180px)"
                  overflowY="auto"
                  p={4}
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'gray',
                      borderRadius: '24px',
                    },
                  }}
                >
                  <VStack spacing={4} align="stretch">
                    {messages.map((msg, index) => (
                      <HStack
                        key={index}
                        alignSelf={msg.senderId === publicKey?.toString() ? 'flex-end' : 'flex-start'}
                        maxW="70%"
                      >
                        {msg.senderId !== publicKey?.toString() && (
                          <Avatar size="sm" name={selectedMatch?.name} src={selectedMatch?.avatar} />
                        )}
                        <Box
                          bg={msg.senderId === publicKey?.toString() ? 'blue.500' : 'gray.100'}
                          color={msg.senderId === publicKey?.toString() ? 'white' : 'black'}
                          px={4}
                          py={2}
                          borderRadius="lg"
                        >
                          <Text>{msg.content}</Text>
                          <Text fontSize="xs" color={msg.senderId === publicKey?.toString() ? 'whiteAlpha.700' : 'gray.500'}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                <Box p={4} w="full" h="80px" borderTopWidth={1} bg={bgColor}>
                  <form onSubmit={handleSendMessage}>
                    <InputGroup size="md">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        bg="white"
                        _dark={{ bg: 'gray.700' }}
                        pr="4.5rem"
                      />
                      <InputRightElement width="4.5rem">
                        <IconButton
                          type="submit"
                          icon={<ArrowForwardIcon />}
                          colorScheme="blue"
                          variant="ghost"
                          isDisabled={!newMessage.trim()}
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </form>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
