import React from 'react';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Navigation() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');

  const links = [
    { name: 'Matches', href: '/' },
    { name: 'Messages', href: '/messages' },
    { name: 'Profile', href: '/profile' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      zIndex={10}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={bgColor}
      px={4}
      py={2}
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <RouterLink to="/">
          <Button
            variant="ghost"
            fontWeight="bold"
            fontSize="xl"
            color="blue.400"
            _hover={{
              bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
              transform: 'translateY(-2px)'
            }}
            transition="all 0.2s"
          >
            Trenchi
          </Button>
        </RouterLink>

        <HStack spacing={4}>
          {links.map((link) => (
            <RouterLink key={link.name} to={link.href}>
              <Button
                variant="ghost"
                size="sm"
                _hover={{
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.2s"
              >
                {link.name}
              </Button>
            </RouterLink>
          ))}

          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
            _hover={{
              bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
              transform: 'translateY(-2px)'
            }}
            transition="all 0.2s"
          />

          <WalletMultiButton />
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navigation;
