import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

function Pricing() {
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: 'Basic Premium',
      price: 0.3,
      duration: '1 week',
      popular: false,
      features: [
        'Unlimited likes for 1 week',
        'Higher chances of matching',
        'Priority profile visibility',
        'See who liked your profile',
        'Advanced filters for better matches'
      ]
    },
    {
      name: 'Extended Premium',
      price: 0.4,
      duration: '2 weeks',
      popular: true,
      features: [
        'Unlimited likes for 2 weeks',
        'Highest chances of matching',
        'Top priority profile visibility',
        'See who liked your profile',
        'Advanced filters for better matches',
        'Special premium badge'
      ]
    }
  ];

  const handlePurchase = async (plan) => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to purchase premium',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedPlan(plan);

      // Platform fee wallet address
      const platformWallet = new PublicKey('5nh3aS9Nm1DH2MDtZU6MPuZyYtA3xXx5YyeS9uxtfk3N');

      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: platformWallet,
        lamports: plan.price * LAMPORTS_PER_SOL,
      });

      transaction.add(transferInstruction);

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);

      // Calculate expiration date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (plan.duration === '1 week' ? 7 : 14));

      // Store subscription in database
      const response = await fetch('http://localhost:5000/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          transactionSignature: signature,
          plan: plan.name,
          expirationDate: expirationDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store subscription');
      }

      // Save to localStorage as backup
      localStorage.setItem('premiumExpiration', expirationDate.toISOString());
      localStorage.setItem('walletAddress', publicKey.toString());

      toast({
        title: 'Premium Activated!',
        description: `You now have unlimited likes for ${plan.duration}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900">
      <Navigation />
      <Container maxW="container.lg" py={20}>
        <VStack spacing={8} align="center">
          <Box textAlign="center">
            <Heading
              color="blue.200"
              fontSize="4xl"
              mb={4}
            >
              Upgrade to Premium
            </Heading>
            <Text fontSize="xl" color="gray.300">
              Get unlimited likes and boost your chances of finding your perfect web3 match!
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            {plans.map((plan, index) => (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="xl"
                p={6}
                bg="gray.800"
                borderColor="gray.700"
                position="relative"
                transform={plan.popular ? 'scale(1.05)' : 'none'}
                zIndex={plan.popular ? 1 : 0}
                boxShadow={plan.popular ? 'xl' : 'base'}
                transition="all 0.2s"
                _hover={{
                  transform: plan.popular ? 'scale(1.1)' : 'scale(1.05)',
                  boxShadow: 'xl',
                }}
              >
                {plan.popular && (
                  <Badge
                    colorScheme="purple"
                    position="absolute"
                    top={4}
                    right={4}
                    fontSize="sm"
                  >
                    Best Value
                  </Badge>
                )}

                <VStack spacing={4} align="stretch">
                  <Heading size="lg" color="white">{plan.name}</Heading>
                  <HStack>
                    <Text fontSize="4xl" fontWeight="bold" color="white">
                      {plan.price}
                    </Text>
                    <Text fontSize="2xl" color="gray.400">
                      SOL
                    </Text>
                  </HStack>
                  <Text color="gray.400">for {plan.duration}</Text>

                  <List spacing={3} my={4}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex}>
                        <HStack spacing={2}>
                          <ListIcon as={CheckCircleIcon} color="green.400" />
                          <Text color="gray.300">{feature}</Text>
                          {featureIndex <= 1 && <Icon as={StarIcon} color="yellow.400" />}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    bg={plan.popular ? 'purple.500' : 'blue.500'}
                    color="white"
                    size="lg"
                    onClick={() => handlePurchase(plan)}
                    isLoading={isProcessing && selectedPlan?.name === plan.name}
                    loadingText="Processing Payment"
                    _hover={{
                      bg: plan.popular ? 'purple.600' : 'blue.600',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Choose {plan.name}
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          <Text fontSize="sm" color="gray.400" textAlign="center" opacity={0.8}>
            Free plan includes 3 likes per day.
            <br />
            Premium gives you unlimited likes and enhanced features.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

export default Pricing;
