import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaWallet, FaUserEdit, FaHeart, FaCoffee } from 'react-icons/fa';

const TutorialStep = ({ icon, title, description }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <HStack
      w="full"
      p={4}
      bg={bgColor}
      rounded="lg"
      spacing={4}
      align="start"
    >
      <Icon as={icon} boxSize={6} color="purple.500" />
      <VStack align="start" spacing={1}>
        <Text fontWeight="bold">{title}</Text>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </VStack>
    </HStack>
  );
};

const WelcomeTutorial = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader fontSize="2xl" textAlign="center">
          Welcome to Trenchi! 🌟
        </ModalHeader>
        <ModalBody>
          <Text textAlign="center" mb={6}>
            Find your perfect Web3 match in just a few steps
          </Text>
          <VStack spacing={4}>
            <TutorialStep
              icon={FaWallet}
              title="1. Connect Your Wallet"
              description="Start by connecting your wallet to access all features"
            />
            <TutorialStep
              icon={FaUserEdit}
              title="2. Create Your Profile"
              description="Make your profile shine with your best photos and interests"
            />
            <TutorialStep
              icon={FaHeart}
              title="3. Start Matching"
              description="Swipe right on profiles you like and start connecting"
            />
            <TutorialStep
              icon={FaCoffee}
              title="4. Meet in Real Life"
              description="Take your connection to the next level with a real-world date"
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="purple" size="lg" w="full" onClick={onClose}>
            Let's Get Started!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeTutorial;
