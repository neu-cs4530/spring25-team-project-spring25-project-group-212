import React, { useEffect } from 'react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Grid, GridItem, HStack, Text, Heading, Flex } from '@chakra-ui/react';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';
import useUserContext from '../../../../hooks/useUserContext';
import useQuestion from '../../../../hooks/useQuestion';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to specified users user page.
   *
   * @param username - The username of the user to be navigated to.
   */
  const clickUsername = (username: string) => {
    navigate(`/user/${username}`);
  };
  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };

  /**
   * Code snippet necessary to add saving and unsaving questions provided there is a questionId
   */
  const { user: currentUser } = useUserContext();
  const { handleToggleSaveQuestion, handleSetQuestionSaved, questionSaved } = useQuestion();

  useEffect(() => {
    handleSetQuestionSaved(currentUser.username, question._id.toString());
  }, [currentUser.username, question._id, handleSetQuestionSaved]);

  return (
    <Box
      p={4}
      borderWidth='1px'
      borderRadius='md'
      boxShadow='sm'
      _hover={{ boxShadow: 'md', cursor: 'pointer' }}
      bg='white'
      onClick={() => handleAnswer(question._id)}>
      <Grid templateColumns='1fr 2fr 1fr 1fr' gap={4} alignItems='center'>
        <GridItem>
          <Text fontWeight='bold'>{question.answers.length || 0} answers</Text>
          <Text>{question.views.length} views</Text>
        </GridItem>

        <GridItem>
          <Heading size='xl' m={2} textDecoration='underline'>
            {question.title}
          </Heading>
          <HStack p={2}>
            {question.tags.map(tag => (
              <Button
                key={String(tag._id)}
                size='sm'
                colorPalette='blue'
                variant='ghost'
                onClick={e => {
                  e.stopPropagation();
                  clickTag(tag.name);
                }}
                cursor='pointer'>
                {tag.name}
              </Button>
            ))}
          </HStack>
        </GridItem>

        <GridItem>
          <Text
            color='red'
            fontStyle={question.anonymous ? 'italic' : ''}
            onClick={e => {
              if (!question.anonymous) {
                e.stopPropagation();
                clickUsername(question.askedBy);
              }
            }}
            cursor='pointer'>
            {question.anonymous ? 'Anonymous' : question.askedBy}
          </Text>
          <Text fontSize='sm' color='gray'>
            asked {getMetaData(new Date(question.askDateTime))}
          </Text>
        </GridItem>

        <GridItem>
          <Flex justifyContent='flex-end'>
            {questionSaved ? (
              <Button
                size='sm'
                colorPalette='blue'
                variant='outline'
                onClick={e => {
                  e.stopPropagation();
                  handleToggleSaveQuestion(currentUser.username, question._id.toString());
                }}>
                Unsave
              </Button>
            ) : (
              <Button
                size='sm'
                colorPalette='blue'
                variant='outline'
                onClick={e => {
                  e.stopPropagation();
                  handleToggleSaveQuestion(currentUser.username, question._id.toString());
                }}>
                Save
              </Button>
            )}
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default QuestionView;
