import React, { useState, useEffect } from 'react';
import WelcomeTutorial from '../components/WelcomeTutorial';
import Navigation from '../components/Navigation';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Text,
  VStack,
  Image,
  Heading,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Center,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
} from '@chakra-ui/react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import api from '../config/api';

export default function Matching() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState(0.25);
  const [balance, setBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState(false);
  const [isTipping, setIsTipping] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const tipModal = useDisclosure();

  // Check subscription status
  const checkSubscription = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'https://trenchi-monorepo.onrender.com'}/api/subscription/${publicKey.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsPremium(!data.isExpired);
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPremium(false);
    }
  };

  // Check subscription on mount and wallet change
  useEffect(() => {
    checkSubscription();
  }, [publicKey]);

  const checkPremiumStatus = () => {
    const premiumExpiration = localStorage.getItem('premiumExpiration');
    const walletAddress = localStorage.getItem('walletAddress');

    if (!premiumExpiration || !walletAddress || walletAddress !== publicKey?.toString()) {
      return false;
    }

    return new Date(premiumExpiration) > new Date();
  };

  const checkDailyLikes = () => {
    const today = new Date().toDateString();
    const likesData = JSON.parse(localStorage.getItem('dailyLikes') || '{}');
    const todayLikes = likesData[today] || 0;
    return todayLikes;
  };

  const updateDailyLikes = () => {
    const today = new Date().toDateString();
    const likesData = JSON.parse(localStorage.getItem('dailyLikes') || '{}');
    likesData[today] = (likesData[today] || 0) + 1;
    localStorage.setItem('dailyLikes', JSON.stringify(likesData));
  };

  useEffect(() => {
    fetchPotentialMatches();
  }, [publicKey]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;
      
      try {
        // Use a more reliable RPC endpoint
        const connection = new Connection(
          process.env.REACT_APP_SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/hTwg5eAf1qtUnvVmtcNgCziDg3cE3-1K',
          'confirmed'
        );
        
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch wallet balance',
          status: 'error',
          duration: 3000,
        });
      }
    };

    fetchBalance();
  }, [publicKey, toast]);

  const fetchPotentialMatches = async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      // In production, these would be API calls:
      // 1. Get user's profile with preferences
      // const userProfileResponse = await fetch(api.getProfile(publicKey.toString()));
      // const userProfile = await userProfileResponse.json();
      
      // 2. Get potential matches filtered by:
      //    - User's gender preference
      //    - Not previously rejected
      //    - Not already matched
      const response = await fetch(api.getPotentialMatches(publicKey.toString()));
      
      if (response.ok) {
        const data = await response.json();
        setPotentialMatches(data);
      } else {
        setPotentialMatches([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTip = async () => {
    if (!publicKey || !potentialMatches[currentIndex]) return;

    try {
      setActionLoading(true);
      const currentMatch = potentialMatches[currentIndex];

      // Connect to Solana network
      const connection = new Connection('https://api.mainnet-beta.solana.com');

      // Calculate fee (5%) and recipient amount (95%)
      const totalLamports = tipAmount * LAMPORTS_PER_SOL;
      const feeLamports = Math.floor(totalLamports * 0.05); // 5% fee
      const recipientLamports = totalLamports - feeLamports;

      // Platform fee wallet address
      const feeWallet = new PublicKey('5nh3aS9Nm1DH2MDtZU6MPuZyYtA3xXx5YyeS9uxtfk3N');

      // Create transaction with two transfers
      const transaction = new Transaction();

      // Add platform fee transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: feeWallet,
          lamports: feeLamports,
        })
      );

      // Add recipient transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(currentMatch.walletAddress),
          lamports: recipientLamports,
        })
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send the transaction
      const signedTx = await wallet.signTransaction(transaction);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);

      // In production, notify backend about the tip
      // await fetch(api.recordTip({
      //   fromWallet: publicKey.toString(),
      //   toWallet: currentMatch.walletAddress,
      //   amount: tipAmount,
      //   txId
      // }));

      // Create an instant match
      toast({
        title: 'Tip Sent! 🎉',
        description: `You sent ${(tipAmount * 0.95).toFixed(3)} SOL to ${currentMatch.name} (5% platform fee)! You can now chat with each other.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to messages
      navigate('/messages');

    } catch (error) {
      console.error('Tip error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!publicKey || !potentialMatches[currentIndex]) return;

    try {
      setActionLoading(true);
      setIsLiking(true);

      const response = await fetch(api.like(potentialMatches[currentIndex].walletAddress), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentWalletAddress: publicKey.toString() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isMatch) {
          toast({
            title: 'It\'s a match! 🎉',
            description: `You matched with ${potentialMatches[currentIndex].name}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }

        // Move to next profile
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to like profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to like profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!publicKey || !potentialMatches[currentIndex]) return;

    try {
      setActionLoading(true);

      const response = await fetch(api.dislike(potentialMatches[currentIndex].walletAddress), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentWalletAddress: publicKey.toString() }),
      });

      if (response.ok) {
        // Move to next profile
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to dislike profile',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error disliking profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to dislike profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
  <Box minH="100vh" bg={useColorModeValue('white', 'gray.900')}>
    <Navigation />
    
    {/* Welcome Tutorial */}
    {!publicKey && (
      <WelcomeTutorial 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />
    )}

      {/* Main Content */}
      {publicKey && isLoading ? (
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="purple.500"
              size="xl"
            />
            <Text color="gray.500">
              Finding your perfect web3 match...
            </Text>
          </VStack>
        </Center>
      ) : !publicKey ? (
        <Center h="calc(100vh - 64px)">
          <VStack spacing={8} p={8} maxW="600px" textAlign="center">
            <Heading 
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
              fontSize={{ base: '3xl', sm: '4xl' }}
            >
              Welcome to Trenchi
            </Heading>
            <Text fontSize={{ base: 'lg', sm: 'xl' }} color="gray.500">
              Find your perfect Web3 match and start your crypto journey together
            </Text>
            <HStack spacing={4}>
              <WalletMultiButton />
              {!showWelcome && (
                <Button
                  colorScheme="purple"
                  size={{ base: 'md', sm: 'lg' }}
                  onClick={() => setShowWelcome(true)}
                >
                  View Tutorial
                </Button>
              )}
            </HStack>
          </VStack>
        </Center>
      ) : (
        <Container maxW="container.xl" py={{ base: 12, sm: 20 }}>
          <VStack spacing={{ base: 4, sm: 8 }} align="center" mb={{ base: 8, sm: 12 }}>
            <Heading
              bgGradient="linear(to-r, purple.400, pink.400)"
              bgClip="text"
              fontSize={{ base: '3xl', sm: '4xl' }}
              textAlign="center"
              fontWeight="bold"
            >
              Match. Chat. Trench. 
            </Heading>
          </VStack>

          <Container maxW={{ base: '100%', sm: '440px' }} w="100%" display="flex" flexDirection="column" alignItems="center" flex={1} px={{ base: 2, sm: 4 }}>
            <Box
              w="100%"
              display="flex"
              justifyContent="center"
              transform="translateZ(0)"
              transition="transform 0.3s ease-in-out"
            >
              {isLoading ? (
                <Center h="60vh">
                  <Spinner size="xl" color="yellow.500" />
                </Center>
              ) : potentialMatches.length === 0 || currentIndex >= potentialMatches.length ? (
                <Center h="60vh" flexDirection="column" gap={4}>
                  <Text fontSize="xl" textAlign="center" color="gray.500">
                    You have seen everyone.
                    <br />
                    Come back later!
                  </Text>
                  <Button
                    colorScheme="yellow"
                    onClick={() => {
                      setCurrentIndex(0);
                      fetchPotentialMatches();
                    }}
                  >
                    Check Again
                  </Button>
                </Center>
              ) : (
                <MatchCard
                  profile={potentialMatches[currentIndex]}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onTip={tipModal.onOpen}
                  loading={actionLoading}
                />
              )}
            </Box>
          </Container>
        </Container>
      )}

      {/* Tip Modal */}
      <Modal isOpen={tipModal.isOpen} onClose={tipModal.onClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.900" color="white" mx={{ base: 4, sm: 0 }}>
          <ModalBody p={{ base: 4, sm: 6 }}>
            <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
              <VStack spacing={{ base: 1, sm: 2 }} align="center">
                <Heading size={{ base: 'sm', sm: 'md' }}>Send Tip</Heading>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Send SOL to instantly match with {potentialMatches[currentIndex]?.name}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Your balance: {balance.toFixed(2)} SOL
                </Text>
              </VStack>

              {!customAmount ? (
                <VStack spacing={{ base: 2, sm: 3 }}>
                  <HStack spacing={{ base: 2, sm: 4 }} width="100%" justify="center">
                    <Button
                      colorScheme={tipAmount === 0.25 ? "yellow" : "whiteAlpha"}
                      onClick={() => setTipAmount(0.25)}
                      width="100%"
                      size={{ base: 'sm', sm: 'md' }}
                    >
                      0.25 SOL
                    </Button>
                    <Button
                      colorScheme={tipAmount === 0.5 ? "yellow" : "whiteAlpha"}
                      onClick={() => setTipAmount(0.5)}
                      width="100%"
                      size={{ base: 'sm', sm: 'md' }}
                    >
                      0.5 SOL
                    </Button>
                  </HStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomAmount(true)}
                  >
                    Enter custom amount
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={3}>
                  <NumberInput
                    min={0.1}
                    max={balance}
                    step={0.1}
                    value={tipAmount}
                    onChange={(value) => setTipAmount(parseFloat(value))}
                    precision={2}
                  >
                    <NumberInputField bg="whiteAlpha.100" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomAmount(false)}
                  >
                    Use preset amounts
                  </Button>
                </VStack>
              )}

              <Button
                colorScheme="yellow"
                width="100%"
                onClick={handleTip}
                isLoading={actionLoading}
                isDisabled={tipAmount > balance || tipAmount <= 0}
                size={{ base: 'sm', sm: 'md' }}
              >
                Send {tipAmount} SOL
              </Button>

              {tipAmount > balance && (
                <Text color="red.300" fontSize="sm" textAlign="center">
                  Insufficient balance
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
