import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import UserCardView from '../userCard';
import { SafeDatabaseUser } from '../../../../types/types';

const UserStack = ({
  users,
  handleUserCardViewClickHandler,
  handleButtonClick = (arg: string) => {},
  buttonText = '',
}: {
  users: SafeDatabaseUser[];
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
  handleButtonClick?: (arg: string) => void;
  buttonText?: string;
}) => (
  <SimpleGrid columns={3} gap={3} p={6}>
    {buttonText === '' ? (
      <>
        {users.map(user => (
          <UserCardView
            key={user.username}
            user={user}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </>
    ) : (
      <>
        {users.map(user => (
          <UserCardView
            key={user.username}
            user={user}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
            handleButtonClick={handleButtonClick}
            buttonText={buttonText}
          />
        ))}
      </>
    )}
  </SimpleGrid>
);

export default UserStack;
