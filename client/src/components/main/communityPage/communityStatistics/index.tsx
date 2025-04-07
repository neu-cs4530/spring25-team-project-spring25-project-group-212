import { useNavigate } from 'react-router-dom';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Badge, Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import useCommunityStatisticsPage from '../../../../hooks/useCommunityStatisticsPage';
import CommunityNavBar from '../communityNavBar';
import QuestionStack from '../../questionPage/questionStack';
import UserStack from '../../usersListPage/userStack';
import StatisticsHeader from '../../statisticsPage/header';
import useUserContext from '../../../../hooks/useUserContext';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

const CommunityStatisticsPage = () => {
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
    questionData,
    memberData,
    communityStatisticsError,
    currentCommunity,
  } = useCommunityStatisticsPage();
  const { user: currentUser, socket } = useUserContext();

  const navigate = useNavigate();

  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  useEffect(() => {
    if (!currentCommunity) {
      return;
    }
    socket.emit('onlineUser', currentCommunity?._id.toString(), currentUser.username);
  }, [currentCommunity, socket, currentUser.username]);

  return (
    <>
      <CommunityNavBar />
      {communityStatisticsError !== '' ? (
        <strong>{communityStatisticsError}</strong>
      ) : (
        <>
          <VStack gap={8} align='stretch' p={6}>
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
            <Box>
              <Text fontWeight='bold' fontSize='xl' mb={4}>
                Community Statistics Over Time
              </Text>
              <HStack gap={6} justify='center' wrap='wrap'>
                {/* Question Count Over Time */}
                <Box
                  borderWidth='1px'
                  borderRadius='md'
                  p={4}
                  bg='white'
                  shadow='sm'
                  flex='1'
                  minW='300px'
                  maxW='600px'
                  w='100%'>
                  <Text fontWeight='semibold' fontSize='md' mb={2} textAlign='center'>
                    Question Count Over Time
                  </Text>
                  <Line
                    data={questionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Member Count Over Time */}
                <Box
                  borderWidth='1px'
                  borderRadius='md'
                  p={4}
                  bg='white'
                  shadow='sm'
                  flex='1'
                  minW='300px'
                  maxW='600px'
                  w='100%'>
                  <Text fontWeight='semibold' fontSize='md' mb={2} textAlign='center'>
                    Member Count Over Time
                  </Text>
                  <Line
                    data={memberData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
              </HStack>
            </Box>
          </VStack>
        </>
      )}
    </>
  );
};

export default CommunityStatisticsPage;
