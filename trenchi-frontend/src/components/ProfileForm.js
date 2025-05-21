import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Textarea,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useWallet } from '@solana/wallet-adapter-react';
import api from '../config/api';

export default function ProfileForm({ existingProfile, onSubmit }) {
  const { publicKey } = useWallet();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(existingProfile || {
    name: '',
    age: '',
    gender: '',
    seekingGender: '',
    bio: '',
    cryptoInterests: '',
    favoriteChains: '',
    profileImage: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(api.updateProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          walletAddress: publicKey ? publicKey.toString() : '',
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      toast({
        title: 'Profile Updated',
        status: 'success',
        duration: 3000,
      });
      
      if (onSubmit) onSubmit(profile);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxW="500px" p={4}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Age</FormLabel>
          <Input
            name="age"
            type="number"
            value={profile.age}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Gender</FormLabel>
          <Select
            name="gender"
            value={profile.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Seeking</FormLabel>
          <Select
            name="seekingGender"
            value={profile.seekingGender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="any">Any</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>Crypto Interests</FormLabel>
          <Textarea
            name="cryptoInterests"
            value={profile.cryptoInterests}
            onChange={handleChange}
            placeholder="What cryptocurrencies are you interested in?"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Favorite Blockchain Networks</FormLabel>
          <Input
            name="favoriteChains"
            value={profile.favoriteChains}
            onChange={handleChange}
            placeholder="e.g., Ethereum, Solana, Polygon"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={loading}
          width="100%"
        >
          Save Profile
        </Button>
      </VStack>
    </Box>
  );
}
