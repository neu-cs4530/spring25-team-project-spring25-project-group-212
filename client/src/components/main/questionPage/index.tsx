import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, HStack, Heading, Text, useDisclosure } from '@chakra-ui/react';
import QuestionHeader from './header';
import useQuestionPage from '../../../hooks/useQuestionPage';
import useUserContext from '../../../hooks/useUserContext';
import QuestionStack from './questionStack';

const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useUserContext();
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('emailPopup') === 'open' && !currentUser.email) {
      onOpen();
    }
  }, [location, currentUser, onOpen]);

  return (
    <Box p={6}>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />
      <div id='question_list' className='question_list'>
        <QuestionStack questions={qlist} />
      </div>
      {titleText === 'Search Results' && !qlist.length && (
        <Text fontWeight='bold' mt={4} textAlign='center'>
          No Questions Found
        </Text>
      )}

      {open && (
        <Box
          position='fixed'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          bg='white'
          p={6}
          borderRadius='md'
          boxShadow='lg'
          zIndex={10}>
          <Heading size='md' mb={4}>
            Your Email is Missing!
          </Heading>
          <Text mb={4}>Add your email to receive daily emails from Fake Stack Overflow.</Text>
          <HStack p={4}>
            <Button
              colorPalette='blue'
              variant='outline'
              onClick={() => {
                onClose();
                navigate('/home');
              }}>
              Ignore
            </Button>
            <Button
              colorPalette='blue'
              onClick={() => {
                onClose();
                navigate(`/user/${currentUser.username}`);
              }}>
              Add Email
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default QuestionPage;
