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
                ...match,
                age: match.age || 'N/A',
                gender: match.gender || 'N/A',
                bio: match.bio || '',
                location: match.location || 'N/A',
                interests: match.interests || [],
                favoriteChains: match.favoriteChains || [],
                images: match.images || []
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async () => {
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
        sender: 'me',
        content: message.content,
        timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
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
      
      // Scroll to bottom
      scrollToBottom();
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
                  href="/matching"
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
                >
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      alignSelf={message.sender === 'me' ? 'flex-end' : 'flex-start'}
                      maxW="70%"
                      mb={4}
                    >
                      <Box
                        bg={message.sender === 'me' ? 'blue.500' : bgColor}
                        color={message.sender === 'me' ? 'white' : 'inherit'}
                        borderRadius="lg"
                        px={4}
                        py={2}
                        borderWidth={message.sender === 'me' ? 0 : '1px'}
                      >
                        <Text>{message.content}</Text>
                      </Box>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {message.timestamp}
                      </Text>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input area */}
                <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
                  <HStack spacing={4}>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      bg={inputBgColor}
                    />
                    <IconButton
                      icon={<FiSend />}
                      onClick={handleSendMessage}
                      colorScheme="blue"
                      isDisabled={!newMessage.trim()}
                    />
                  </HStack>
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
        isOpen={showProfile}
        placement="right"
        onClose={onClose}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={2}>
              <Heading size="lg">{selectedMatch?.name}</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="blue">{selectedMatch?.profile?.age} years</Badge>
                <Badge colorScheme="purple">{selectedMatch?.profile?.gender}</Badge>
              </HStack>
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            {selectedMatch && showProfile && (
              <VStack spacing={6} align="stretch" py={4}>
                {/* Profile Images */}
                <Box>
                  <Text fontWeight="bold" mb={3}>Photos</Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {selectedMatch.profile.images?.map((image, index) => (
                      <Box 
                        key={index} 
                        borderRadius="lg" 
                        overflow="hidden"
                        position="relative"
                        paddingBottom="100%"
                      >
                        <Image
                          src={image}
                          alt={`Profile photo ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </Box>
                    ))}
                  </Grid>
                </Box>

                {/* Bio */}
                <Box>
                  <Text fontWeight="bold" mb={3}>Bio</Text>
                  <Text>{selectedMatch.profile.bio}</Text>
                </Box>

                {/* Interests */}
                <Box>
                  <Text fontWeight="bold" mb={3}>Interests</Text>
                  <Wrap spacing={2}>
                    {selectedMatch.profile.interests?.map((interest, index) => (
                      <WrapItem key={index}>
                        <Badge colorScheme="purple">{interest}</Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>

                {/* Location */}
                <Box>
                  <Text fontWeight="bold" mb={3}>Location</Text>
                  <Text>{selectedMatch.profile.location}</Text>
                </Box>

                {/* Additional Info */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Favorite Chains</Text>
                  <Wrap spacing={2}>
                    {selectedMatch.profile.favoriteChains?.map((chain, index) => (
                      <Badge key={index} colorScheme="blue">{chain}</Badge>
                    ))}
                  </Wrap>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
