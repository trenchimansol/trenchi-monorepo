import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  Image,
  Text,
  Heading,
  useToast,
  IconButton,
  HStack,
  Textarea,
  Center,
  Spinner,
  Grid,
  AspectRatio,
  Stack,
  useColorModeValue,
  Select,
} from '@chakra-ui/react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import api from '../config/api';

function Profile() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];
  const cryptoInterestOptions = [
    'Trading Memes',
    'Learning Crypto',
    'Finding Web3 Love',
    'Just for Fun'
  ];

  const blockchainOptions = [
    'Solana',
    'Bitcoin',
    'Ethereum',
    'Binance',
    'Other'
  ];

  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    seeking: '',
    cryptoInterests: cryptoInterestOptions[0],
    favoriteBlockchainNetworks: blockchainOptions[0],
    images: Array(3).fill(''),
    walletAddress: '',
    isComplete: false,
    referralCode: '',
    referredBy: ''
  });

  const genderOptions = ['Man', 'Woman'];
  const seekingOptions = ['Man', 'Woman'];
  
  // Helper function to get seeking label
  const getSeekingLabel = (gender, seeking) => {
    if (!gender || !seeking) return '';
    return `${gender} seeking ${seeking.toLowerCase()}`;
  };
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Initialize images array if needed
  useEffect(() => {
    if (!profile.images || !Array.isArray(profile.images)) {
      setProfile(prev => ({ ...prev, images: Array(3).fill('') }));
    }
  }, []);

  // Validate profile completeness
  useEffect(() => {
    const requiredFields = ['name', 'age', 'gender', 'bio', 'seeking', 'cryptoInterests', 'favoriteBlockchainNetworks'];
    const isComplete = requiredFields.every(field => profile[field]) && 
      Array.isArray(profile.images) && profile.images.every(img => img !== '');
    setProfile(prev => ({ ...prev, isComplete }));
  }, [profile]);

  const handlePhotoUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => {
          // Create a new array if images doesn't exist
          const currentImages = Array.isArray(prev.images) ? prev.images : Array(3).fill('');
          const newImages = [...currentImages];
          newImages[index] = reader.result;
          return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index) => {
    setProfile(prev => {
      const currentImages = Array.isArray(prev.images) ? prev.images : Array(3).fill('');
      const newImages = [...currentImages];
      newImages[index] = '';
      return { ...prev, images: newImages };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent changes to referredBy if it's already set
    if (name === 'referredBy' && profile.referredBy) {
      return;
    }
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (publicKey) {
      setProfile(prev => ({
        ...prev,
        walletAddress: publicKey.toString(),
      }));
      fetchProfile();
      
      // Fetch wallet balance
      const getBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / 1000000000); // Convert lamports to SOL
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(0);
        }
      };
      
      getBalance();
    }
  }, [publicKey, connection]);

  const fetchProfile = async (retryCount = 0) => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const response = await fetch(api.getProfile(publicKey.toString()), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://trenchmatch.com'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update profile state with fetched data including referral code
        setProfile({
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || '',
          seeking: data.seeking || '',
          bio: data.bio || '',
          cryptoInterests: data.cryptoInterests || cryptoInterestOptions[0],
          favoriteBlockchainNetworks: data.favoriteBlockchainNetworks || blockchainOptions[0],
          walletAddress: data.walletAddress || publicKey.toString(),
          images: data.images || Array(3).fill(''),
          referralCode: data.referralCode || '',
          referredBy: data.referredBy || '',
          matchCount: data.matchCount || 0,
          matchPoints: data.matchPoints || 0,
          referralCount: data.referralCount || 0,
          referralPoints: data.referralPoints || 0,
          totalPoints: data.totalPoints || 0,
          isComplete: true
        });
      } else if (response.status === 404) {
        if (!response.ok) {
          if (response.status === 404) {
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.log('Profile not found - initializing empty profile');
            }
            setProfile({
              name: '',
              age: '',
              gender: '',
              seeking: '',
              bio: '',
              cryptoInterests: cryptoInterestOptions[0],
              favoriteBlockchainNetworks: blockchainOptions[0],
              walletAddress: publicKey.toString(),
              images: Array(3).fill(''),
              referralCode: '',
              referredBy: '',
              matchCount: 0,
              matchPoints: 0,
              referralCount: 0,
              referralPoints: 0,
              totalPoints: 0,
              isComplete: false
            });
            return;
          }
          // Only retry on server errors or network issues
          if ((response.status >= 500 || response.status === 0) && retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return fetchProfile(retryCount + 1);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const response = await fetch(`${api.baseUrl}/profile/${publicKey.toString()}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://trenchmatch.com'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
        status: 'success',
        duration: 5000,
      });

      // Reset form
      setProfile({
        name: '',
        age: '',
        gender: '',
        seeking: '',
        bio: '',
        cryptoInterests: cryptoInterestOptions[0],
        favoriteBlockchainNetworks: blockchainOptions[0],
        walletAddress: '',
        images: Array(3).fill(''),
        isComplete: false,
        referralCode: '',
        referredBy: ''
      });

    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Validate required fields
    const requiredFields = [
      'name', 'age', 'gender', 'bio', 'seeking',
      'cryptoInterests', 'favoriteBlockchainNetworks', 'images'
    ];
    const missingFields = requiredFields.filter(field => {
      if (field === 'images') {
        // All 3 images are required
        return profile.images.some(img => img === '');
      }
      return !profile[field];
    });

    // Special message for missing photos
    if (missingFields.includes('images')) {
      toast({
        title: 'Photos Required',
        description: 'Please upload all 3 photos to continue',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const isNewProfile = !profile.isComplete;

      const response = await fetch(api.updateProfile(publicKey.toString()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://trenchmatch.com'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...profile,
          walletAddress: publicKey.toString(),
          points: isNewProfile ? 10 : profile.points // Add 10 points for new profiles
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(prev => ({
        ...prev,
        ...data,
        isComplete: true,
      }));

      toast({
        title: `Profile ${isNewProfile ? 'Created' : 'Updated'} Successfully`,
        description: isNewProfile ? 'You earned 10 points for creating your profile!' : undefined,
        status: 'success',
        duration: 5000,
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <Center minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} pt={24} pb={16}>
        <Box
          maxW="container.md"
          p={{ base: 4, md: 8 }}
          bg={bgColor}
          boxShadow={{ base: 'none', md: 'lg' }}
          borderRadius={{ base: 'none', md: 'xl' }}
        >
          <VStack spacing={4} align="center" w="full">
            <Heading
              size={{ base: 'md', md: 'lg' }}
              textAlign="center"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Connect Your Wallet
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
              Please connect your Solana wallet to create your profile
            </Text>
            <WalletMultiButton />
          </VStack>
        </Box>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} pt={24} pb={16}>
      <Box
        maxW="container.md" 
        p={{ base: 4, md: 8 }} 
        bg={bgColor}
        boxShadow={{ base: 'none', md: 'lg' }} 
        borderRadius={{ base: 'none', md: 'xl' }}
        w={{ base: 'full', md: 'auto' }}
      >
        <VStack spacing={{ base: 4, md: 6 }} as="form" onSubmit={handleSubmit} align="stretch" w="full">
          <Heading
            fontSize={{ base: 'xl', md: '2xl' }}
            textAlign="center"
            mb={{ base: 4, md: 6 }}
          >
            {profile.isComplete ? 'Edit Profile' : 'Create Profile'}
          </Heading>

          <FormControl isRequired mb={{ base: 2, md: 4 }}>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Name</FormLabel>
            <Input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Your name or X handle"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            />
          </FormControl>

          <FormControl isRequired mb={{ base: 2, md: 4 }}>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Age</FormLabel>
            <Input
              name="age"
              type="number"
              value={profile.age}
              onChange={handleChange}
              placeholder="Your age"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>I am a</FormLabel>
            <Select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              placeholder="Select gender"
            >
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Looking for a</FormLabel>
            <Select
              name="seeking"
              value={profile.seeking}
              onChange={handleChange}
              placeholder="Select preference"
            >
              {seekingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {profile.gender && profile.seeking && (
              <FormHelperText color="blue.500">
                {getSeekingLabel(profile.gender, profile.seeking)}
              </FormHelperText>
            )}
          </FormControl>

          <FormControl isRequired mb={{ base: 2, md: 4 }}>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Bio</FormLabel>
            <Textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              rows={4}
            />
            <FormHelperText>Share your interests and what you're looking for</FormHelperText>
          </FormControl>

          <FormControl isRequired mb={{ base: 2, md: 4 }}>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Crypto Interests</FormLabel>
            <Select
              name="cryptoInterests"
              value={profile.cryptoInterests}
              onChange={handleChange}
              placeholder="Select your main crypto interest"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              isRequired
            >
              {cryptoInterestOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired mb={{ base: 2, md: 4 }}>
            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Favorite Blockchain Networks</FormLabel>
            <Select
              name="favoriteBlockchainNetworks"
              value={profile.favoriteBlockchainNetworks}
              onChange={handleChange}
              placeholder="Select your favorite blockchain"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              isRequired
            >
              {blockchainOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <FormHelperText>Which blockchain networks do you use the most?</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">Wallet Balance</FormLabel>
            <Input
              value={`${balance.toFixed(4)} SOL`}
              isReadOnly
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            />
            <FormHelperText>Current balance in your connected wallet</FormHelperText>
          </FormControl>

          {/* Referral Code Display for Existing Users */}
          {profile.referralCode && (
            <FormControl>
              <FormLabel fontWeight="bold" color="purple.500">
                Your Referral Code
              </FormLabel>
              <Input
                value={profile.referralCode}
                isReadOnly
                bg="purple.50"
                _dark={{ 
                  bg: 'purple.900',
                  _hover: { bg: 'purple.800' }
                }}
                onClick={(e) => {
                  e.target.select();
                  navigator.clipboard.writeText(profile.referralCode);
                  toast({
                    title: 'Referral Code Copied! 🎉',
                    description: 'Share this code with your friends!',
                    status: 'success',
                    duration: 2000,
                  });
                }}
                cursor="pointer"
                _hover={{ bg: 'purple.100' }}
                fontSize="lg"
                textAlign="center"
                fontWeight="bold"
              />
              <FormHelperText>Share this code with friends to earn rewards!</FormHelperText>
            </FormControl>
          )}

          {/* Referral Code Input */}
          <FormControl>
            <FormLabel fontWeight="bold" color="purple.500">
              {profile.referredBy ? 'Your Referral Code' : 'Have a Referral Code?'}
            </FormLabel>
            <Input
              name="referredBy"
              value={profile.referredBy}
              onChange={handleChange}
              placeholder="Enter your friend's referral code"
              _placeholder={{ color: 'gray.400' }}
              borderColor="purple.200"
              _hover={{ borderColor: profile.referredBy ? 'purple.200' : 'purple.300' }}
              _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
              isReadOnly={!!profile.referredBy}
              bg={profile.referredBy ? 'purple.50' : 'white'}
              _dark={{
                bg: profile.referredBy ? 'purple.900' : 'gray.700',
                _hover: { bg: profile.referredBy ? 'purple.900' : 'gray.600' }
              }}
            />
            <FormHelperText>
              {profile.referredBy 
                ? 'Referral code has been applied and cannot be changed'
                : 'Enter a friend\'s referral code to get started!'}
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="medium">Photos</FormLabel>
            <HStack spacing={{ base: 2, md: 4 }} justify="center" flexWrap="wrap">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <Box 
                    key={index} 
                    position="relative" 
                    w={{ base: '80px', md: '100px' }} 
                    h={{ base: '80px', md: '100px' }}
                    mb={{ base: 2, md: 0 }}
                  >
                    <Box
                      w="full"
                      h="full"
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="gray.300"
                      borderRadius="lg"
                      overflow="hidden"
                      position="relative"
                      bg="gray.50"
                      _dark={{ bg: 'gray.700' }}
                    >
                      <Box position="relative" w="full" h="full">
                      {profile?.images?.[index] ? (
                        <Image
                          src={profile.images[index]}
                          alt={`Photo ${index + 1}`}
                          objectFit="cover"
                          w="full"
                          h="full"
                        />
                      ) : (
                        <Button
                          h="full"
                          w="full"
                          variant="ghost"
                          onClick={() => fileInputRefs[index].current.click()}
                        >
                          <AddIcon />
                        </Button>
                      )}
                    </Box>
                    </Box>
                    {profile?.images?.[index] && (
                      <IconButton
                        icon={<CloseIcon />}
                        size="sm"
                        position="absolute"
                        top={1}
                        right={1}
                        colorScheme="red"
                        onClick={() => handleRemovePhoto(index)}
                        zIndex={2}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, index)}
                      ref={fileInputRefs[index]}
                      style={{ display: 'none' }}
                    />
                  </Box>
                ))}
            </HStack>
            <FormHelperText 
              textAlign="center" 
              fontSize={{ base: 'xs', md: 'sm' }}
              mt={{ base: 1, md: 2 }}
              color="red.500"
              fontWeight="medium"
            >
              All 3 photos are required. First photo will be your main profile picture.
            </FormHelperText>
          </FormControl>

          <VStack spacing={4} width="100%">
            {!profile.isComplete && (
              <Box
                p={4}
                bg="blue.50"
                _dark={{ bg: 'blue.900' }}
                borderRadius="md"
                width="100%"
              >
                <Text fontSize="sm" color="blue.600" _dark={{ color: 'blue.200' }}>
                  🎉 Create your profile and earn 10 points! Points can be used for additional features and rewards.
                </Text>
              </Box>
            )}
            <Button
              type="submit"
              colorScheme="blue"
              size={{ base: 'md', md: 'lg' }}
              w="full"
              h={{ base: 12, md: 14 }}
              isLoading={loading}
              loadingText={profile.isComplete ? 'Updating...' : 'Creating...'}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              fontSize={{ base: 'md', md: 'lg' }}
              transition="all 0.2s"
            >
              {profile.isComplete ? 'Update Profile' : 'Create Profile'}
            </Button>

            {profile.isComplete && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                opacity={0.6}
                _hover={{
                  opacity: 1,
                  transform: 'translateY(-1px)'
                }}
                onClick={() => {
                  const confirmed = window.confirm(
                    'Are you sure you want to delete your account? This action cannot be undone.'
                  );
                  if (confirmed) {
                    handleDeleteAccount();
                  }
                }}
              >
                Delete Account
              </Button>
            )}

            <Text 
              fontSize={{ base: 'xs', md: 'sm' }} 
              color="gray.500" 
              textAlign="center"
              mt={{ base: 2, md: 4 }}
            >
              Connected wallet: {profile.walletAddress ? `${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}` : 'Not connected'}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Center>
  );
}

export default Profile;
