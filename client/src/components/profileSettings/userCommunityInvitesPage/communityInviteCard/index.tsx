import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { Box, Button, Heading, VStack } from '@chakra-ui/react';

const CommunityInviteCard = ({
  community,
  handleAcceptInvite,
  handleDeclineInvite,
}: {
  community: PopulatedDatabaseCommunity;
  handleAcceptInvite: (communityId: string) => void;
  handleDeclineInvite: (communityId: string) => void;
}) => (
  <Box
    borderWidth='1px'
    borderRadius='md'
    p={4}
    boxShadow='sm'
    _hover={{ boxShadow: 'md' }}
    bg='white'>
    <VStack align='stretch' gap={3}>
      <Heading as='h3' size='md'>
        {community.name}
      </Heading>

      <Box display='flex' justifyContent='space-between'>
        <Button colorPalette='blue' onClick={() => handleAcceptInvite(community._id.toString())}>
          Accept Invite
        </Button>
        <Button colorPalette='red' onClick={() => handleDeclineInvite(community._id.toString())}>
          Decline Invite
        </Button>
      </Box>
    </VStack>
  </Box>
);

export default CommunityInviteCard;
