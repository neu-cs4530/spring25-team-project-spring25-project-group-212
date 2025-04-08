import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { handleHyperlink } from '../../../../tool';
import CommentSection from '../../commentSection';
import './index.css';
import { Comment, DatabaseComment } from '../../../../types/types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 * - isMarkdown Boolean indicating if the text should be rendered as markdown.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  meta: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
  isMarkdown?: boolean;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks or rendered as markdown based on the isMarkdown prop.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 * @param isMarkdown Boolean indicating if the text should be rendered as markdown.
 */
const AnswerView = ({
  text,
  ansBy,
  meta,
  comments,
  handleAddComment,
  isMarkdown = false,
}: AnswerProps) => (
  <Flex borderBottom='1px solid' borderColor='gray.200' flexDir='row'>
    <Box id='answerText' className='answerText' ml={6}>
      {isMarkdown ? <ReactMarkdown>{text}</ReactMarkdown> : handleHyperlink(text)}
    </Box>
    <Box className='answerAuthor' mr={6}>
      <Box className='answer_author'>{ansBy}</Box>
      <Box className='answer_question_meta'>{meta}</Box>
    </Box>
    <CommentSection comments={comments} handleAddComment={handleAddComment} />
  </Flex>
);

export default AnswerView;
