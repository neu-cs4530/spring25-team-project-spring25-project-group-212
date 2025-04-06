import React from 'react';
import { Box, Flex, Text, Grid, GridItem, Button } from '@chakra-ui/react';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 * handleButtonClick - A function specifically for a button on the userCard
 * buttonText - the text of that button
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
  handleButtonClick?: (arg: string) => void;
  buttonText?: string;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const {
    user,
    handleUserCardViewClickHandler,
    handleButtonClick = (arg: string) => {},
    buttonText = '',
  } = props;

  return (
    <Box
      p={4}
      borderWidth='1px'
      borderRadius='md'
      boxShadow='sm'
      _hover={{ boxShadow: 'md', cursor: 'pointer' }}
      bg='white'
      onClick={() => handleUserCardViewClickHandler(user)}>
      <Grid templateColumns='2fr 3fr 1fr' gap={4} alignItems='center'>
        <GridItem>
          <Text fontWeight='bold' fontSize='lg'>
            {user.username}
          </Text>
        </GridItem>

        <GridItem>
          <Text fontSize='sm' color='gray.500'>
            Joined: {new Date(user.dateJoined).toUTCString()}
          </Text>
        </GridItem>

        <GridItem>
          <Flex justifyContent='flex-end'>
            {buttonText === '' ? (
              <Text fontSize='sm' color='blue' cursor='pointer'>
                View Profile
              </Text>
            ) : (
              <Button
                fontSize='sm'
                colorPalette='blue'
                onClick={e => {
                  e.stopPropagation();
                  handleButtonClick(user.username);
                }}>
                {buttonText}
              </Button>
            )}
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default UserCardView;
