import React from 'react';
import {
  Box,
  Container,
  Stack,
  HStack,
  Link,
  Text,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaXTwitter, FaDiscord } from 'react-icons/fa6';

function Footer() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      as="footer"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      py={8}
      mt="auto"
    >
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 6, md: 8 }}
          justify="space-between"
          align="center"
        >
          {/* Links */}
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={{ base: 3, sm: 8 }}
            align={{ base: 'center', sm: 'center' }}
          >
            <Link
              href="/terms"
              color={textColor}
              _hover={{ color: 'purple.400' }}
              fontSize="sm"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              color={textColor}
              _hover={{ color: 'purple.400' }}
              fontSize="sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color={textColor}
              _hover={{ color: 'purple.400' }}
              fontSize="sm"
            >
              Docs
            </Link>
          </Stack>

          {/* Social Links */}
          <HStack spacing={4}>
            <IconButton
              as="a"
              href="https://x.com/trenchmatcher"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              icon={<FaXTwitter />}
              variant="ghost"
              color={textColor}
              _hover={{
                bg: 'transparent',
                color: 'purple.400',
                transform: 'translateY(-2px)',
              }}
              transition="all 0.2s"
            />
            <IconButton
              as="a"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              icon={<FaDiscord />}
              variant="ghost"
              color={textColor}
              _hover={{
                bg: 'transparent',
                color: 'purple.400',
                transform: 'translateY(-2px)',
              }}
              transition="all 0.2s"
            />
          </HStack>

          {/* Copyright */}
          <Text color={textColor} fontSize="sm">
            © {new Date().getFullYear()} Trenchi. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
