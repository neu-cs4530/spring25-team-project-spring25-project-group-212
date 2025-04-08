import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Text, Button, VStack, Grid, GridItem, Flex } from '@chakra-ui/react';
import { handleHyperlink } from '../../../../tool';
import useUserContext from '../../../../hooks/useUserContext';
import useQuestion from '../../../../hooks/useQuestion';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 * - isMarkdown - Boolean indicating if the text should be rendered as markdown.
 * - qid - String representing the ObjectId of the question.
 * - anonymous - If the question should be rendered anonymous.
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
  isMarkdown?: boolean;
  qid: string;
  anonymous: boolean;
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink or markdown handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 * @param isMarkdown Whether to render the text as markdown.
 * @param qid String representing the ObjectId of the question.
 * @param anonymous If the question should be rendered anonymous.
 */
const QuestionBody = ({
  views,
  text,
  askby,
  meta,
  isMarkdown = false,
  qid,
  anonymous,
}: QuestionBodyProps) => {
  const { user: currentUser } = useUserContext();
  const { handleToggleSaveQuestion, handleSetQuestionSaved, questionSaved } = useQuestion();

  useEffect(() => {
    handleSetQuestionSaved(currentUser.username, qid);
  }, [currentUser.username, qid, handleSetQuestionSaved]);

  return (
    <Grid
      templateColumns='1fr 3fr 1fr 1fr'
      gap={4}
      alignItems='center'
      borderBottom='1px solid'
      borderColor='gray.200'>
      <GridItem>
        <Text fontSize='2xl' fontWeight='bold' mb={4} ml={4}>
          {views} views
        </Text>
      </GridItem>
      <GridItem>
        <Box mb={4}>
          {isMarkdown ? <ReactMarkdown>{text}</ReactMarkdown> : handleHyperlink(text)}
        </Box>
      </GridItem>
      <GridItem>
        <VStack align='start' gap={2} mb={4} ml={4}>
          <Text color='gray.600' fontStyle={anonymous ? 'italic' : 'normal'}>
            {anonymous ? 'Anonymous' : askby}
          </Text>
          <Text color='gray.400'>asked {meta}</Text>
        </VStack>
      </GridItem>
      <GridItem>
        <Flex justify='flex-end'>
          <Button
            colorPalette='blue'
            variant='outline'
            onClick={() => handleToggleSaveQuestion(currentUser.username, qid)}
            mr={8}>
            {questionSaved ? 'Unsave' : 'Save'}
          </Button>
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default QuestionBody;
