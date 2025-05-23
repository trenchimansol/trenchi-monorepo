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
    if (selectedMatch) {
      setShowProfile(true);
      onOpen();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey) return;

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
              name: match.name,
              walletAddress: match.walletAddress,
              lastMessage: conversation?.lastMessage || '',
              time: conversation ? new Date(conversation.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
              unreadCount: conversation?.unreadCount || 0,
              profile: match,
              images: match.images || [],
              avatar: match.profilePicture || match.images?.[0] || null
            };
          })
        );

        setMatches(matchesWithProfiles);

        // If there's a selected match, fetch their messages
        if (selectedMatch) {
          const history = await getChatHistory(publicKey.toString(), selectedMatch.walletAddress);
          const formattedMessages = history.map(msg => ({
            id: msg._id,
            sender: msg.senderId === publicKey.toString() ? 'me' : 'other',
            content: msg.content,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
  }, [publicKey, selectedMatch?.walletAddress]);

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
            borderRight={{ base: 'none', md: `1px solid` }}
            borderRightColor={borderColor}
            pr={{ base: 0, md: 4 }}
            overflowY="auto"
            maxH={{ base: 'auto', md: 'calc(100vh - 100px)' }}
          >
            {matches.length === 0 ? (
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
            ) : (
              matches.map((match) => (
                <Box
                  key={match.id}
                  p={3}
                  cursor="pointer"
                  borderRadius="md"
                  bg={selectedMatch?.id === match.id ? selectedBg : 'transparent'}
                  _hover={{ bg: selectedMatch?.id === match.id ? selectedBg : hoverBg }}
                  onClick={() => handleSelectMatch(match)}
                >
                  <HStack spacing={3}>
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
                        {match.lastMessage || 'Start a conversation!'}
                      </Text>
                    </Box>
                    {match.time && (
                      <Text fontSize="xs" color="gray.500">
                        {match.time}
                      </Text>
                    )}
                  </HStack>
                </Box>
              ))
            )}
          </GridItem>

          <GridItem display={{ base: selectedMatch ? 'block' : 'none', md: 'block' }}>
            {selectedMatch ? (
              <Box h="full" display="flex" flexDirection="column">
                <HStack p={4} borderBottom="1px solid" borderColor={borderColor} spacing={4}>
                  <IconButton
                    icon={<ArrowBackIcon />}
                    aria-label="Back"
                    variant="ghost"
                    display={{ base: 'inline-flex', md: 'none' }}
                    onClick={() => setSelectedMatch(null)}
                  />
                  <Avatar 
                    size="md"
                    src={selectedMatch.avatar} 
                    name={selectedMatch.name}
                  />
                  <Box flex="1">
                    <Text fontWeight="bold">{selectedMatch.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedMatch.profile.bio?.slice(0, 50)}...
                    </Text>
                  </Box>
                  <Button
                    leftIcon={<InfoIcon />}
                    onClick={handleViewProfile}
                    variant="ghost"
                    size="sm"
                  >
                    View Profile
                  </Button>
                </HStack>

                <Box flex="1" overflowY="auto" p={4}>
                  <VStack spacing={4} align="stretch">
                    {messages.map((message) => (
                      <HStack
                        key={message.id}
                        alignSelf={message.sender === 'me' ? 'flex-end' : 'flex-start'}
                        spacing={2}
                      >
                        {message.sender !== 'me' && (
                          <Avatar
                            size="sm"
                            src={selectedMatch.avatar}
                            name={selectedMatch.name}
                          />
                        )}
                        <Box
                          maxW="70%"
                          bg={message.sender === 'me' ? 'blue.500' : 'gray.100'}
                          color={message.sender === 'me' ? 'white' : 'black'}
                          px={4}
                          py={2}
                          borderRadius="lg"
                        >
                          <Text>{message.content}</Text>
                          <Text fontSize="xs" color={message.sender === 'me' ? 'whiteAlpha.700' : 'gray.500'} mt={1}>
                            {message.timestamp}
                          </Text>
                        </Box>
                        {message.sender === 'me' && (
                          <Avatar
                            size="sm"
                            name="Me"
                          />
                        )}
                      </HStack>
                    ))}
                    <div ref={messagesEndRef} />
                  </VStack>
                </Box>

                <Box 
                  p={4} 
                  borderTop="1px solid" 
                  borderColor={borderColor}
                >
                  <HStack spacing={2}>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      bg={inputBgColor}
                      borderRadius="full"
                    />
                    <IconButton
                      icon={<FiSend />}
                      aria-label="Send message"
                      colorScheme="blue"
                      isDisabled={!newMessage.trim()}
                      rounded="full"
                      onClick={handleSendMessage}
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
                <Text color="gray.500">
                  Select a match to start chatting
                </Text>
              </Box>
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
                          position="absolute"
                          top={0}
                          left={0}
                          width="100%"
                          height="100%"
                          objectFit="cover"
                          alt={`${selectedMatch.name}'s photo ${index + 1}`}
                        />
                      </Box>
                    ))}
                  </Grid>
                </Box>

                {/* Bio */}
                <Box>
                  <Text fontWeight="bold" mb={2}>About</Text>
                  <Text>{selectedMatch.profile.bio}</Text>
                </Box>

                {/* Looking For */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Looking For</Text>
                  <Text>{selectedMatch.profile.seeking}</Text>
                </Box>

                {/* Interests */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Interests</Text>
                  <Wrap spacing={2}>
                    {selectedMatch.profile.interests?.map((interest, index) => (
                      <Badge key={index} colorScheme="green">{interest}</Badge>
                    ))}
                  </Wrap>
                </Box>

                {/* Crypto Interests */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Crypto Interests</Text>
                  <Wrap spacing={2}>
                    {selectedMatch.profile.cryptoInterests?.map((interest, index) => (
                      <Badge key={index} colorScheme="purple">{interest}</Badge>
                    ))}
                  </Wrap>
                </Box>

                {/* Favorite Chains */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Favorite Chains</Text>
                  <Wrap spacing={2}>
                    {selectedMatch.profile.favoriteChains?.map((chain, index) => (
                      <Badge key={index} colorScheme="blue">{chain}</Badge>
                    ))}
                  </Wrap>
                </Box>

                {/* Wallet */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Wallet</Text>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text>Balance:</Text>
                      <Badge colorScheme="yellow">{selectedMatch.profile.walletBalance || 0} SOL</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" wordBreak="break-all">
                      {selectedMatch.profile.walletAddress}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
