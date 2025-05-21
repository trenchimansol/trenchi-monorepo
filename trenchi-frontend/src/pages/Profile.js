import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  FormHelperText, 
  Heading, 
  Input, 
  Select, 
  Text, 
  Textarea, 
  VStack, 
  HStack, 
  Image, 
  IconButton, 
  Center, 
  useToast,
  AspectRatio,
  Stack
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
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    seeking: '',
    bio: '',
    cryptoInterests: '',
    favoriteChains: '',
    walletAddress: '',
    photos: ['', '', ''],
    isComplete: false
  });

  const genderOptions = ['Male', 'Female'];
  const seekingOptions = ['Male', 'Female'];

  // Validate profile completeness
  useEffect(() => {
    const requiredFields = ['name', 'age', 'gender', 'seeking', 'bio', 'cryptoInterests', 'favoriteChains'];
    const isComplete = requiredFields.every(field => profile[field]);
    setProfile(prev => ({ ...prev, isComplete }));
  }, [profile.name, profile.age, profile.gender, profile.seeking, profile.bio, profile.cryptoInterests, profile.favoriteChains]);

  const handlePhotoUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => {
          const newPhotos = [...prev.photos];
          newPhotos[index] = reader.result;
          return { ...prev, photos: newPhotos };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index) => {
    setProfile(prev => {
      const newPhotos = [...prev.photos];
      newPhotos[index] = '';
      return { ...prev, photos: newPhotos };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
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

  const fetchProfile = async () => {
    try {
      // For development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // const response = await fetch(api.getProfile(publicKey.toString()));
      // if (!response.ok) throw new Error('Failed to fetch profile');
      // const data = await response.json();
      // setProfile(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.isComplete) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      // For development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await fetch(api.updateProfile(), {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(profile),
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
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

  if (!publicKey) {
    return (
      <Center minH="100vh" p={4}>
        <Box 
          maxW="sm" 
          w="100%" 
          p={8} 
          textAlign="center" 
          bg="white" 
          _dark={{ bg: 'gray.800' }}
          borderRadius="xl"
          shadow="xl"
        >
          <Stack spacing={6} align="center">
            <Heading size="lg">
              Connect Your Wallet
            </Heading>
            <Text color="gray.500" mb={4}>
              Please connect your wallet to create and manage your profile.
            </Text>
            <WalletMultiButton />
          </Stack>
        </Box>
      </Center>
    );
  }



  if (!publicKey) {
    return (
      <Center minH="100vh" p={4}>
        <Box 
          maxW="sm" 
          w="100%" 
          p={8} 
          textAlign="center" 
          bg="white" 
          _dark={{ bg: 'gray.800' }}
          shadow="xl"
          borderRadius="xl"
        >
          <VStack spacing={4}>
            <Heading
              fontSize="2xl"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Connect Your Wallet
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Please connect your Solana wallet to create your profile
            </Text>
          </VStack>
        </Box>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} pt={24} pb={16}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        _dark={{ bg: 'gray.800' }}
        borderRadius="xl"
        shadow="xl"
        p={8}
        w="90%"
        maxW="500px"
      >
        <VStack spacing={6} align="stretch">
          <Heading
            fontSize="2xl"
            textAlign="center"
            mb={6}
          >
            Create Your Profile
          </Heading>

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Name</FormLabel>
            <Input
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Your name"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Age</FormLabel>
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
            <FormLabel fontWeight="medium">Gender</FormLabel>
            <Select
              name="gender"
              value={profile.gender}
              onChange={handleChange}
              placeholder="Select gender"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Seeking</FormLabel>
            <Select
              name="seeking"
              value={profile.seeking}
              onChange={handleChange}
              placeholder="Select preference"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Bio</FormLabel>
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

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Crypto Interests</FormLabel>
            <Textarea
              name="cryptoInterests"
              value={profile.cryptoInterests}
              onChange={handleChange}
              placeholder="What aspects of crypto interest you?"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
              rows={2}
            />
            <FormHelperText>What aspects of crypto interest you the most?</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="medium">Favorite Blockchain Networks</FormLabel>
            <Input
              name="favoriteChains"
              value={profile.favoriteChains}
              onChange={handleChange}
              placeholder="e.g., Ethereum, Solana, Polygon"
              size="lg"
              bg="gray.50"
              _dark={{ bg: 'gray.700' }}
            />
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

          <FormControl>
            <FormLabel fontWeight="medium">Photos</FormLabel>
            <HStack spacing={4} justify="center">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <Box key={index} position="relative" w="100px" h="100px">
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
                      {profile.photos && profile.photos[index] ? (
                        <Image
                          src={profile.photos[index]}
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
                    {profile.photos && profile.photos[index] && (
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
            <FormHelperText textAlign="center">Upload up to 3 photos. First photo will be your main profile picture.</FormHelperText>
          </FormControl>

          <FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              h={14}
              isLoading={loading}
              loadingText="Saving..."
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Save Profile
            </Button>

            <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
              Connected wallet: {profile.walletAddress ? `${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}` : 'Not connected'}
            </Text>
          </FormControl>
        </VStack>
      </Box>
    </Center>
  );
}

export default Profile;
