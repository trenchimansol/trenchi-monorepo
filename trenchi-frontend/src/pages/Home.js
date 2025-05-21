import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import Navigation from '../components/Navigation';

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const MotionBox = motion(Box);
const MotionText = motion(Text);

export default function Home() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const gradientBg = 'linear(to-r, purple.400, pink.400)';
  const glowStyle = {
    _after: {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '150%',
      height: '150%',
      opacity: 0.15,
      background: gradientBg,
      filter: 'blur(60px)',
      zIndex: -1,
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} overflow="hidden" position="relative">
      <Navigation />
      
      {/* Background Animation Elements */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.1}>
        <MotionBox
          position="absolute"
          top="10%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          bgGradient={gradientBg}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          filter="blur(60px)"
        />
        <MotionBox
          position="absolute"
          bottom="20%"
          right="10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bgGradient={gradientBg}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          filter="blur(80px)"
        />
      </Box>

      <Container maxW="container.xl" position="relative">
        <VStack spacing={12} align="center" minH="80vh" justify="center" position="relative" {...glowStyle}>
          {/* Hero Section */}
          <VStack spacing={8} textAlign="center" maxW="800px">
            <AnimatePresence>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Heading
                  as="h1"
                  fontSize={{ base: '6xl', md: '8xl' }}
                  bgGradient={gradientBg}
                  bgClip="text"
                  letterSpacing="tight"
                  lineHeight="1.1"
                  mb={6}
                  textAlign="center"
                  fontWeight="extrabold"
                >
                  Match. Chat.
                  <br />
                  Trench.
                </Heading>
              </MotionBox>

              <MotionText
                fontSize={{ base: '2xl', md: '3xl' }}
                maxW="xl"
                mx="auto"
                color={textColor}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                mb={12}
              >
                Decentralized Dating.
                <br />
                Real Connections.
              </MotionText>

              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  as={RouterLink}
                  to="/matches"
                  size="lg"
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient={gradientBg}
                  color="white"
                  px={10}
                  py={8}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  transition="all 0.2s"
                >
                  Start Matching
                </Button>
              </MotionBox>
            </AnimatePresence>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
