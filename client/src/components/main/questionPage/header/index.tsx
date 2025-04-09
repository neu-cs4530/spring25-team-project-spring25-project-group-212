import React from 'react';
import './index.css';
import { Box, ButtonGroup, Flex, Text } from '@chakra-ui/react';
import OrderButton from './orderButton';
import { OrderType } from '../../../../types/types';
import { orderTypeDisplayName } from '../../../../types/constants';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * qcnt - The number of questions to be displayed in the header.
 * setQuestionOrder - A function that sets the order of questions based on the selected message.
 */
interface QuestionHeaderProps {
  titleText: string;
  qcnt: number;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * QuestionHeader component displays the header section for a list of questions.
 * It includes the title, a button to ask a new question, the number of the quesions,
 * and buttons to set the order of questions.
 *
 * @param titleText - The title text to display in the header.
 * @param qcnt - The number of questions displayed in the header.
 * @param setQuestionOrder - Function to set the order of questions based on input message.
 */
const QuestionHeader = ({ titleText, qcnt, setQuestionOrder }: QuestionHeaderProps) => (
  <Box p={4}>
    <Flex justify='space-between' align='center' mb={4}>
      <Text fontWeight='bold' fontSize='xl'>
        {titleText}
      </Text>
      <AskQuestionButton />
    </Flex>

    <Flex justify='space-between' align='center'>
      <Text id='question_count' fontSize='md' color='gray.600'>
        {qcnt} questions
      </Text>
      <ButtonGroup gap={4}>
        {Object.keys(orderTypeDisplayName).map(order => (
          <OrderButton
            key={order}
            orderType={order as OrderType}
            setQuestionOrder={setQuestionOrder}
          />
        ))}
      </ButtonGroup>
    </Flex>
  </Box>
);

export default QuestionHeader;
