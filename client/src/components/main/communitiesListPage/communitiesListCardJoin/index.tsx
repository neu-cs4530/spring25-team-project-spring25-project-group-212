import React from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';

const CommunitiesListCardJoin = ({
  community,
  handleCommunityJoin,
  handleCommunityPreview,
}: {
  community: PopulatedDatabaseCommunity;
  handleCommunityJoin: (communityId: string | undefined) => void;
  handleCommunityPreview: (communityId: string | undefined) => void;
}) => {
  const navigate = useNavigate();
  return (
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
        <VStack align='stretch' p={2}>
          <Button
            colorPalette='blue'
            size='sm'
            onClick={() => handleCommunityJoin(community._id?.toString())}>
            Join Community
          </Button>
          <Button
            colorPalette='blue'
            size='sm'
            variant='outline'
            onClick={() =>
              navigate(`/community/${community._id?.toString()}`, {
                state: { isPreview: true },
              })
            }>
            Preview Community
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};
export default CommunitiesListCardJoin;
