import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  HStack,
  useColorModeValue,
  IconButton,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaCoins } from 'react-icons/fa';

export default function MatchCard({ profile, onLike, onDislike, onTip, loading }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const bgColor = useColorModeValue('white', 'gray.800');

  if (!profile) {
    return (
      <Box
        bg={bgColor}
        rounded="2xl"
        shadow="xl"
        overflow="hidden"
        w="100%"
        maxW="440px"
        h="600px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">No profile available</Text>
      </Box>
    );
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const nextPhoto = () => {
    const maxIndex = (profile.photos?.length || 1) - 1;
    setCurrentPhotoIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  };

  return (
    <Box
      w="100%"
      maxW={{ base: '100%', sm: '400px' }}
      borderRadius={{ base: 'xl', sm: '2xl' }}
      overflow="hidden"
      bg="white"
      _dark={{ bg: 'gray.800' }}
      shadow="2xl"
      transform="auto"
      transition="all 0.3s ease"
      _hover={{ transform: { base: 'none', sm: 'scale(1.02)' } }}
      position="relative"
    >
      <Box
        bg={bgColor}
        rounded="2xl"
        shadow="xl"
        overflow="hidden"
        w="100%"
        maxW="440px"
        position="relative"
      >
        <Box position="relative">
          <Image
            src={profile?.photos?.[currentPhotoIndex] || profile?.profileImage || 'https://via.placeholder.com/400x600'}
            alt={`${profile.name} - Photo ${currentPhotoIndex + 1}`}
            objectFit="cover"
            w="100%"
            h={{ base: '380px', sm: '440px' }}
          />
          {profile?.photos?.length > 1 && (
            <>
              <IconButton
                icon={<ChevronLeftIcon boxSize={8} />}
                position="absolute"
                left={2}
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
                colorScheme="whiteAlpha"
                color="white"
                onClick={prevPhoto}
                isDisabled={currentPhotoIndex === 0}
                _hover={{ bg: 'whiteAlpha.300' }}
              />
              <IconButton
                icon={<ChevronRightIcon boxSize={8} />}
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                variant="ghost"
                colorScheme="whiteAlpha"
                color="white"
                onClick={nextPhoto}
                isDisabled={currentPhotoIndex === profile.photos.length - 1 || !profile.photos[currentPhotoIndex + 1]}
                _hover={{ bg: 'whiteAlpha.300' }}
              />
            </>
          )}
          <Flex
            position="absolute"
            bottom={2}
            left="50%"
            transform="translateX(-50%)"
            gap={2}
          >
            {profile?.photos?.map((photo, index) => photo && (
              <Box
                key={index}
                w={2}
                h={2}
                borderRadius="full"
                bg={index === currentPhotoIndex ? 'white' : 'whiteAlpha.500'}
              />
            ))}
          </Flex>
        </Box>
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="150px"
          bgGradient="linear(to-t, blackAlpha.800, transparent)"
        />
        <Box
          position="absolute"
          bottom={6}
          left={6}
          right={6}
          color="white"
        >
          <HStack justify="space-between" width="100%" mb={2}>
            <Text fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="bold">
              {profile?.name || 'Anonymous'}, {profile?.age || '?'}
            </Text>
            {profile.walletAddress && (
              <Badge 
                colorScheme="purple" 
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="full"
              >
                {`${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}`}
              </Badge>
            )}
          </HStack>
        </Box>
      </Box>

      <Box p={6}>
        <VStack align="start" spacing={4}>

          <Text 
            color="gray.600" 
            _dark={{ color: 'gray.300' }}
            fontSize="sm"
            noOfLines={3}
          >
            {profile?.bio || 'No bio available'}
          </Text>

          <Box w="100%">
            <Text 
              fontWeight="bold" 
              mb={1}
              fontSize="sm"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Portfolio Value
            </Text>
            <Text 
              color="gray.600" 
              _dark={{ color: 'gray.300' }}
              fontSize="sm"
              fontWeight="semibold"
            >
              {profile?.portfolioValueSOL || '0'} SOL
            </Text>
          </Box>

          <Box w="100%">
            <Text 
              fontWeight="bold" 
              mb={1}
              fontSize="sm"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Interests
            </Text>
            <Text 
              color="gray.600" 
              _dark={{ color: 'gray.300' }}
              fontSize="sm"
              noOfLines={2}
            >
              {profile?.cryptoInterests || 'No interests listed'}
            </Text>
          </Box>

          <Box w="100%">
            <Text 
              fontWeight="bold" 
              mb={1}
              fontSize="sm"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Favorite Chains
            </Text>
            <Text 
              color="gray.600" 
              _dark={{ color: 'gray.300' }}
              fontSize="sm"
              noOfLines={1}
            >
              {profile?.favoriteChains || 'Solana'}
            </Text>
          </Box>

          <HStack spacing={{ base: 4, sm: 8 }} mt={6} width="100%" justify="center" px={{ base: 2, sm: 4 }}>
            <IconButton
              icon={<CloseIcon />}
              onClick={onDislike}
              isLoading={loading}
              colorScheme="red"
              variant="solid"
              size={{ base: 'md', sm: 'lg' }}
              width={{ base: '56px', sm: '64px' }}
              height={{ base: '56px', sm: '64px' }}
              isRound
              _hover={{
                transform: { base: 'none', sm: 'scale(1.1)' },
                shadow: 'lg',
              }}
              transition="all 0.2s"
            />
            <IconButton
              icon={<FaCoins />}
              onClick={onTip}
              isLoading={loading}
              colorScheme="yellow"
              variant="solid"
              size={{ base: 'md', sm: 'lg' }}
              width={{ base: '56px', sm: '64px' }}
              height={{ base: '56px', sm: '64px' }}
              isRound
              _hover={{
                transform: { base: 'none', sm: 'scale(1.1)' },
                shadow: 'lg',
                color: 'yellow.300',
              }}
              transition="all 0.2s"
            />
            <IconButton
              icon={<CheckIcon />}
              onClick={onLike}
              isLoading={loading}
              colorScheme="green"
              variant="solid"
              size={{ base: 'md', sm: 'lg' }}
              width={{ base: '56px', sm: '64px' }}
              height={{ base: '56px', sm: '64px' }}
              isRound
              _hover={{
                transform: { base: 'none', sm: 'scale(1.1)' },
                shadow: 'lg',
              }}
              transition="all 0.2s"
            />
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
