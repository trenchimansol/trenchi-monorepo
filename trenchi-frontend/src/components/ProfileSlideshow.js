import React, { useState, useEffect } from 'react';
import {
  Box,
  Image,
  HStack,
  Button,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const profiles = [
  {
    image: '/demo/profile1.png',
    name: 'Lily',
    age: '25',
    bio: 'Fashion enthusiast and crypto trader',
  },
  {
    image: '/demo/profile2.png',
    name: 'Jessica',
    age: '27',
    bio: 'Country music lover and adventurer',
  },
  {
    image: '/demo/profile3.png',
    name: 'Alex',
    age: '28',
    bio: 'Software developer and coffee addict',
  },
  {
    image: '/demo/profile4.png',
    name: 'James',
    age: '26',
    bio: 'Tech enthusiast and gamer',
  },
  {
    image: '/demo/profile5.png',
    name: 'Marcus',
    age: '29',
    bio: 'Entrepreneur and fitness lover',
  },
];

export default function ProfileSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + profiles.length) % profiles.length);
  };

  return (
    <Box
      position="relative"
      w="full"
      maxW="400px"
      mx="auto"
      overflow="hidden"
    >
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="2xl"
        overflow="hidden"
        p={4}
      >
        <VStack spacing={3}>
          <Box position="relative" w="full" h="400px">
            <AnimatePresence initial={false} custom={direction}>
              <MotionBox
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                position="absolute"
                width="100%"
                height="100%"
              >
                <VStack spacing={4} h="full">
                  <Image
                    src={profiles[currentIndex].image}
                    alt={profiles[currentIndex].name}
                    objectFit="cover"
                    borderRadius="xl"
                    w="full"
                    h="400px"
                  />
                  <VStack spacing={1} textAlign="center">
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                      {profiles[currentIndex].name}, {profiles[currentIndex].age}
                    </Text>
                    <Text color={textColor} fontSize="sm">
                      {profiles[currentIndex].bio}
                    </Text>
                  </VStack>
                </VStack>
              </MotionBox>
            </AnimatePresence>
          </Box>

          <HStack spacing={4} justify="center" w="full">
            <Button
              rounded="full"
              size="lg"
              colorScheme="red"
              flex={1}
              onClick={() => paginate(1)}
            >
              ✕
            </Button>
            <Button
              rounded="full"
              size="lg"
              colorScheme="green"
              flex={1}
              onClick={() => paginate(1)}
            >
              ♥
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
