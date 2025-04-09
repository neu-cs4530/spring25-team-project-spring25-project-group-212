import { Box, Text, VStack, Badge, HStack } from '@chakra-ui/react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';
import useStatisticsPage from '../../../hooks/useStatisticsPage';
import StatisticsHeader from './header';
import QuestionStack from '../questionPage/questionStack';
import UserStack from '../usersListPage/userStack';

/**
 * StatisticsPage component renders a page displaying a list of statistics
 * for top questions and users.
 */
const StatisticsPage = () => {
  const {
    topVotedQuestions,
    topViewedQuestions,
    topVotedQuestionVotes,
    topViewedQuestionViews,
    topAskingUsers,
    topViewingUsers,
    topVotingUsers,
    topAnsweringUsers,
    topViewerCount,
    topVoterCount,
    topAskerQuestionCount,
    topAnswererAnswerCount,
  } = useStatisticsPage();

  const navigate = useNavigate();

  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  return (
    <VStack gap={6} align='stretch' p={6}>
      <StatisticsHeader />
      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The most questions asked by ${topAskingUsers.length > 1 ? 'users' : 'a user'}:`}
          </Text>
          {!topAskingUsers.length || topAskingUsers.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No questions asked
            </Text>
          ) : (
            <Badge colorScheme='blue' fontSize='md' px={3} py={1} borderRadius='md'>
              {topAskerQuestionCount} Questions
            </Badge>
          )}
        </HStack>
        {(!topAskingUsers.length || topAskingUsers.length !== 0) && (
          <UserStack
            users={topAskingUsers}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        )}
      </Box>

      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The most answers made by ${topAnsweringUsers.length > 1 ? 'users' : 'a user'}:`}
          </Text>
          {!topAnsweringUsers.length || topAnsweringUsers.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No answers made
            </Text>
          ) : (
            <Badge colorScheme='orange' fontSize='md' px={3} py={1} borderRadius='md'>
              {topAnswererAnswerCount} Answers
            </Badge>
          )}
        </HStack>
        {(!topAnsweringUsers.length || topAnsweringUsers.length !== 0) && (
          <UserStack
            users={topAnsweringUsers}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        )}
      </Box>

      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The most votes cast by ${topVotingUsers.length > 1 ? 'users' : 'a user'}:`}
          </Text>
          {!topVotingUsers.length || topVotingUsers.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No votes cast
            </Text>
          ) : (
            <Badge colorScheme='purple' fontSize='md' px={3} py={1} borderRadius='md'>
              {topVoterCount} Votes
            </Badge>
          )}
        </HStack>
        {(!topVotingUsers.length || topVotingUsers.length !== 0) && (
          <UserStack
            users={topVotingUsers}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        )}
      </Box>

      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The most questions viewed by ${topViewingUsers.length > 1 ? 'users' : 'a user'}:`}
          </Text>
          {!topViewingUsers.length || topViewingUsers.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No questions viewed
            </Text>
          ) : (
            <Badge colorScheme='green' fontSize='md' px={3} py={1} borderRadius='md'>
              {topViewerCount} Views
            </Badge>
          )}
        </HStack>
        {(!topViewingUsers.length || topViewingUsers.length !== 0) && (
          <UserStack
            users={topViewingUsers}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        )}
      </Box>

      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The most viewed ${topViewedQuestions.length > 1 ? 'questions' : 'question'}:`}
          </Text>
          {!topViewedQuestions.length || topViewedQuestions.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No questions viewed
            </Text>
          ) : (
            <Badge colorScheme='teal' fontSize='md' px={3} py={1} borderRadius='md'>
              {topViewedQuestionViews} Views
            </Badge>
          )}
        </HStack>
        {(!topViewedQuestions.length || topViewedQuestions.length !== 0) && (
          <QuestionStack questions={topViewedQuestions} />
        )}
      </Box>

      <Box>
        <HStack mb={3}>
          <Text fontWeight='semibold' fontSize='lg'>
            {`The best voted ${topVotedQuestions.length > 1 ? 'questions' : 'question'}:`}
          </Text>
          {!topVotedQuestions.length || topVotedQuestions.length === 0 ? (
            <Text fontWeight='bold' color='gray.600'>
              No questions voted
            </Text>
          ) : (
            <Badge colorScheme='cyan' fontSize='md' px={3} py={1} borderRadius='md'>
              {topVotedQuestionVotes} Votes
            </Badge>
          )}
        </HStack>
        {(!topVotedQuestions.length || topVotedQuestions.length !== 0) && (
          <QuestionStack questions={topVotedQuestions} />
        )}
      </Box>
    </VStack>
  );
};

export default StatisticsPage;
