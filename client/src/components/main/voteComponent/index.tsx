import { Box, Button, Flex } from '@chakra-ui/react';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { PopulatedDatabaseQuestion } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ question });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Box className='vote-container'>
      <Button
        colorPalette={voted === 1 ? 'green' : 'gray'}
        variant={voted === 1 ? 'solid' : 'outline'}
        onClick={() => handleVote('upvote')}>
        Upvote
      </Button>
      <Button
        colorPalette={voted === -1 ? 'red' : 'gray'}
        variant={voted === -1 ? 'solid' : 'outline'}
        onClick={() => handleVote('downvote')}>
        Downvote
      </Button>
      <Flex className='vote-count'>{count}</Flex>
    </Box>
  );
};

export default VoteComponent;
