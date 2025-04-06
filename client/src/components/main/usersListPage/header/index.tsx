import React from 'react';
import { Flex, Box, Input, Text } from '@chakra-ui/react';
import './index.css';
import useUserSearch from '../../../../hooks/useUserSearch';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <Flex
      direction='column'
      gap={4}
      p={4}
      borderWidth='1px'
      borderRadius='md'
      boxShadow='sm'
      bg='gray.50'>
      <Flex justify='space-between' align='center'>
        <Text fontSize='lg' fontWeight='bold'>
          Users List
        </Text>
        <Input
          id='user_search_bar'
          placeholder={`Search from ${userCount} users...`}
          value={val}
          onChange={handleInputChange}
          bg='white'
          borderColor='gray.300'
          _placeholder={{ color: 'gray.500' }}
        />
      </Flex>
      <Flex justify='flex-end'>
        <Text id='user_count' fontSize='sm' color='gray.600'>
          {userCount} users
        </Text>
      </Flex>
    </Flex>
  );
};

export default UsersListHeader;
