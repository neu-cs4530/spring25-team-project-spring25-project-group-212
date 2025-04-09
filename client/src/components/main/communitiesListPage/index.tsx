import React from 'react';
import { Box, Button, Heading, Text, HStack, SimpleGrid } from '@chakra-ui/react';
import useCommunitiesListPage from '../../../hooks/useCommunitiesListPage';
import useUserContext from '../../../hooks/useUserContext';
import CommunitiesListCardJoin from './communitiesListCardJoin';
import CommunitiesListCardView from './communitiesListCardView';

const CommunitiesListPage = () => {
  const {
    communities,
    error,
    handleJoin,
    handleCreateCommunity,
    sortCommunitiesBy,
    handlePreviewCommunity,
  } = useCommunitiesListPage();
  const { user } = useUserContext();

  const joinedCommunities = communities.filter(c => c.members.includes(user.username));
  const unjoinedCommunities = communities.filter(c => !c.members.includes(user.username));

  return (
    <Box p={6}>
      {error && (
        <Box mb={4} p={4} bg='red.100' borderRadius='md'>
          <Text color='red.500'>{error}</Text>
        </Box>
      )}

      <Heading size='xl' mb={6}>
        Communities
      </Heading>

      <HStack p={4} mb={6}>
        <Button colorPalette='blue' onClick={handleCreateCommunity}>
          Create Community
        </Button>
        <Button colorPalette='blue' variant='outline' onClick={() => sortCommunitiesBy('members')}>
          Sort by Members
        </Button>
        <Button colorPalette='blue' variant='outline' onClick={() => sortCommunitiesBy('content')}>
          Sort by Content
        </Button>
      </HStack>

      <Box height='1px' bg='gray.200' my={6} />

      <Box mb={8}>
        <Heading size='md' mb={4}>
          Joined Communities
        </Heading>
        <SimpleGrid columns={3} gap={6} p={6}>
          {joinedCommunities.length > 0 ? (
            joinedCommunities.map(c => (
              <CommunitiesListCardView
                key={c._id.toString()}
                community={c}
                handleCommunityJoin={() => handleJoin(c._id.toString())}
              />
            ))
          ) : (
            <Text>No joined communities yet.</Text>
          )}
        </SimpleGrid>
      </Box>

      <Box height='1px' bg='gray.200' my={6} />

      <Box>
        <Heading size='md' mb={4}>
          Other Communities
        </Heading>
        <SimpleGrid columns={3} gap={6} p={6}>
          {unjoinedCommunities.length > 0 ? (
            unjoinedCommunities.map(c => (
              <CommunitiesListCardJoin
                key={c._id.toString()}
                community={c}
                handleCommunityJoin={() => handleJoin(c._id.toString())}
                handleCommunityPreview={() => handlePreviewCommunity(c._id.toString())}
              />
            ))
          ) : (
            <Text>No other communities available.</Text>
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default CommunitiesListPage;
