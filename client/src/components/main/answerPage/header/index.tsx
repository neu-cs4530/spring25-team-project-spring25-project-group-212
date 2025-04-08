import React from 'react';
import './index.css';
import { Flex, Text } from '@chakra-ui/react';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  ansCount: number;
  title: string;
}

/**
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ ansCount, title }: AnswerHeaderProps) => (
  <Flex
    id='answersHeader'
    justify='space-between'
    align='center'
    p={4}
    borderBottom='1px solid'
    borderColor='gray.200'>
    <Text fontSize='2xl' fontWeight='bold'>
      {ansCount} answers
    </Text>
    <Text fontSize='lg' fontWeight='bold' textAlign='center'>
      {title}
    </Text>
    <AskQuestionButton />
  </Flex>
);

export default AnswerHeader;
