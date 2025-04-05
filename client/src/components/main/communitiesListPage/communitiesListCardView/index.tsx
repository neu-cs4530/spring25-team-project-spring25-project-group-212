import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';

const CommunitiesListCardView = ({
  community,
  handleCommunityJoin,
}: {
  community: PopulatedDatabaseCommunity;
  handleCommunityJoin: (communityId: string | undefined) => void;
}) => (
  <Box
    p={4}
    borderWidth='1px'
    borderRadius='md'
    boxShadow='sm'
    _hover={{ boxShadow: 'md' }}
    bg='white'>
    <VStack align='start' p={3}>
      <Text>
        <strong>Community Name:</strong> {community.name}
      </Text>
      <Text>
        <strong>Community Rules:</strong> {community.rules}
      </Text>
      <Button
        colorPalette='blue'
        size='sm'
        onClick={() => handleCommunityJoin(community._id?.toString())}>
        View Community
      </Button>
    </VStack>
  </Box>
);

export default CommunitiesListCardView;
