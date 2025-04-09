import React from 'react';
import { Box, Heading, SimpleGrid, Text, Center } from '@chakra-ui/react';
import useUserCommunityInvitesPage from '../../../hooks/useUserCommunityInvitesPage';
import CommunityInviteCard from './communityInviteCard';

const UserCommunityInvitesPage = () => {
  const { communitiesInvitedTo, handleAcceptInvite, handleDeclineInvite } =
    useUserCommunityInvitesPage();

  return (
    <Box mx='auto' p={6}>
      <Heading as='h1' size='lg' mb={6} textAlign='center'>
        Community Invites
      </Heading>
      {communitiesInvitedTo.length === 0 ? (
        <Center>
          <Text fontSize='lg' color='gray.500'>
            No Invites
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={4} gap={6}>
          {communitiesInvitedTo.map(community => (
            <CommunityInviteCard
              key={community._id.toString()}
              handleAcceptInvite={handleAcceptInvite}
              handleDeclineInvite={handleDeclineInvite}
              community={community}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default UserCommunityInvitesPage;
