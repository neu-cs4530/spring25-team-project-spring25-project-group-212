import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Box, Text, Spacer, Button } from '@chakra-ui/react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  return (
    <Flex id='header' className='header' align='center' px={4} py={2}>
      <Box>
        <Text fontSize='3xl' fontWeight='bold'>
          Community Overflow
        </Text>
      </Box>
      <Spacer />
      <Flex gap={2}>
        <Button
          aria-label='View Profile'
          onClick={() => navigate(`/user/${currentUser.username}`)}
          variant='ghost'
          colorScheme='whiteAlpha'>
          <FiUser />
        </Button>
        <Button
          aria-label='Log Out'
          onClick={handleSignOut}
          variant='ghost'
          colorScheme='whiteAlpha'>
          <FiLogOut />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Header;
