import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Image,
  HStack,
  IconButton,
  Badge,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export default function MatchProfile({ profile }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="2xl"
      overflow="hidden"
      shadow="xl"
      maxW="sm"
      w="100%"
    >
      <Box position="relative" pb="100%" bg="gray.100" _dark={{ bg: 'gray.700' }}>
        <Image
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          objectFit="cover"
        />
        {profile.photos.length > 1 && (
          <>
            <IconButton
              icon={<ChevronLeftIcon boxSize={8} />}
              variant="ghost"
              colorScheme="whiteAlpha"
              position="absolute"
              left={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handlePrevPhoto}
              isRound
              bg="blackAlpha.300"
              _hover={{ bg: "blackAlpha.400" }}
            />
            <IconButton
              icon={<ChevronRightIcon boxSize={8} />}
              variant="ghost"
              colorScheme="whiteAlpha"
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              onClick={handleNextPhoto}
              isRound
              bg="blackAlpha.300"
              _hover={{ bg: "blackAlpha.400" }}
            />
            <HStack
              position="absolute"
              bottom={4}
              left="50%"
              transform="translateX(-50%)"
              spacing={2}
            >
              {profile.photos.map((_, index) => (
                <Box
                  key={index}
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={index === currentPhotoIndex ? "white" : "whiteAlpha.600"}
                />
              ))}
            </HStack>
          </>
        )}
      </Box>

      <VStack spacing={4} p={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">{profile.name}, {profile.age}</Heading>
        </Flex>

        <Text color="gray.600" _dark={{ color: 'gray.300' }}>
          {profile.bio}
        </Text>

        <Box>
          <Text fontWeight="semibold" mb={2}>Crypto Interests</Text>
          <Text color="gray.600" _dark={{ color: 'gray.300' }}>
            {profile.cryptoInterests}
          </Text>
        </Box>

        <Box>
          <Text fontWeight="semibold" mb={2}>Favorite Chains</Text>
          <HStack spacing={2} flexWrap="wrap">
            {profile.favoriteChains.split(',').map((chain, index) => (
              <Badge
                key={index}
                colorScheme="blue"
                px={3}
                py={1}
                borderRadius="full"
              >
                {chain.trim()}
              </Badge>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text fontWeight="semibold" mb={2}>Portfolio Value</Text>
          <Text color="green.500" fontWeight="bold">
            {profile.portfolioValue} SOL
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
