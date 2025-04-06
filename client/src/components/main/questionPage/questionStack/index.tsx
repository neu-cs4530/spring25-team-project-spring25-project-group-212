import React from 'react';
import { VStack } from '@chakra-ui/react';
import QuestionView from '../question';
import { PopulatedDatabaseQuestion } from '../../../../types/types';

const QuestionStack = ({ questions }: { questions: PopulatedDatabaseQuestion[] }) => (
  <VStack p={6} align='stretch'>
    {questions.map(question => (
      <QuestionView key={String(question._id)} question={question} />
    ))}
  </VStack>
);

export default QuestionStack;
