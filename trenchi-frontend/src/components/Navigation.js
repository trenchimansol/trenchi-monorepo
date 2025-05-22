import React from 'react';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  HStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
  VStack,
  Collapse,
  useBreakpointValue,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Navigation() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const { isOpen, onToggle } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const links = [
    { name: 'Matches', href: '/matches' },
    { name: 'Messages', href: '/messages' },
    { name: 'Profile', href: '/profile' },
    { name: 'Leaderboard', href: '/leaderboard' },
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

        {!isMobile ? (
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
          </HStack>
        ) : (
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant="ghost"
            aria-label="Toggle Navigation"
          />
        )}

        {!isMobile && (
          <HStack spacing={4} position="absolute" right={4}>
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
        )}
      </Flex>

      {/* Mobile Navigation Menu */}
      <Collapse in={isOpen && isMobile}>
        <VStack
          spacing={4}
          p={4}
          bg={bgColor}
          display={{ base: 'flex', md: 'none' }}
          borderBottom="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align="flex-start"
          w="100%"
        >
          {links.map((link) => (
            <RouterLink key={link.name} to={link.href} style={{ width: '100%' }}>
              <Button
                variant="ghost"
                size="sm"
                width="auto"
                onClick={onToggle}
                justifyContent="flex-start"
                _hover={{
                  bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                }}
              >
                {link.name}
              </Button>
            </RouterLink>
          ))}
          <Box width="100%">
            <Button
              variant="ghost"
              size="sm"
              width="auto"
              leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              justifyContent="flex-start"
              _hover={{
                bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
              }}
            >
              {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
          </Box>
          <Box width="100%">
            <WalletMultiButton />
          </Box>
        </VStack>
      </Collapse>
    </Box>
  );
}

export default Navigation;
