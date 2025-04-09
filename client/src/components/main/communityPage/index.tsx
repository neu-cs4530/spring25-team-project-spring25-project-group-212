import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner, Center, Box, VStack, Text, Input, Button, Flex, Heading } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';
import useUserContext from '../../../hooks/useUserContext';
import { joinCommunity } from '../../../services/communityService';
import useCommunityNameAboutRules from '../../../hooks/useCommunityNameAboutRules';
import CommunityNavBar from './communityNavBar';
import QuestionStack from '../questionPage/questionStack';

const CommunityPage = () => {
  const { titleText, qlist, setQuestionOrder } = useCommunityQuestionPage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === 'true';

  const {
    community,
    editMode,
    setEditMode,
    newName,
    setNewName,
    newAbout,
    setNewAbout,
    newRules,
    setNewRules,
    handleEditNameAboutRules,
    canEditNameAboutRules,
    communityExistsError,
  } = useCommunityNameAboutRules();

  const { user, socket } = useUserContext();

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const primaryBtnBg = isDark ? 'blue.300' : 'blue.500';
  const primaryBtnHoverBg = isDark ? 'blue.400' : 'blue.600';
  const primaryBtnActiveBg = isDark ? 'blue.500' : 'blue.700';

  const deleteBtnBg = isDark ? 'red.300' : 'red.500';
  const deleteBtnHoverBg = isDark ? 'red.400' : 'red.600';
  const deleteBtnActiveBg = isDark ? 'red.500' : 'red.700';

  useEffect(() => {
    if (!community || !user || !socket) return undefined;

    const userHasJoinedCommunity = community.members.includes(user.username);

    if (!userHasJoinedCommunity && !isPreview) {
      socket.emit('joinCommunity', community._id.toString(), user.username);
      joinCommunity(community._id.toString(), user.username);
    }

    return () => {
      if (userHasJoinedCommunity) {
        socket.emit('leaveCommunity', community._id.toString(), user.username);
      }
    };
  }, [community, user, socket, isPreview]);

  if (!community) {
    return (
      <Center height='100vh'>
        <Spinner size='xl' />
      </Center>
    );
  }

  const userHasJoinedCommunity = community.members.includes(user.username);

  return (
    <>
      {communityExistsError !== '' ? (
        <Text fontWeight='bold'>{communityExistsError}</Text>
      ) : (
        <Box>
          <CommunityNavBar />
          <Box p={4}>
            {!editMode && (
              <VStack align='flex-start' gap={3} mb={4} ml={4}>
                <Flex>
                  <Heading size='4xl'>{community.name}</Heading>
                </Flex>
                <Box>
                  <Text fontWeight='bold' mb={1}>
                    About:
                  </Text>
                  <Text>{community.about}</Text>
                </Box>
                <Box>
                  <Text fontWeight='bold' mb={1}>
                    Rules:
                  </Text>
                  <Text>{community.rules}</Text>
                </Box>
                {userHasJoinedCommunity && canEditNameAboutRules && (
                  <Button
                    bg={primaryBtnBg}
                    color='white'
                    _hover={{ bg: primaryBtnHoverBg }}
                    _active={{ bg: primaryBtnActiveBg }}
                    onClick={() => {
                      setEditMode(true);
                      setNewName(community?.name || '');
                      setNewAbout(community?.about || '');
                      setNewRules(community?.rules || '');
                    }}
                    p={2}
                    m={0}
                    borderRadius='md'>
                    Edit Name, About, and/or Rules
                  </Button>
                )}
              </VStack>
            )}

            {userHasJoinedCommunity && editMode && canEditNameAboutRules && (
              <VStack align='stretch' gap={3} mb={4}>
                <Input
                  placeholder='Enter new name...'
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  size='md'
                  maxWidth='400px'
                  borderColor='gray.300'
                  _focus={{ borderColor: 'blue.500' }}
                />
                <Input
                  placeholder='Enter new about...'
                  value={newAbout}
                  onChange={e => setNewAbout(e.target.value)}
                  size='md'
                  maxWidth='400px'
                  borderColor='gray.300'
                  _focus={{ borderColor: 'blue.500' }}
                />
                <Input
                  placeholder='Enter new rules...'
                  value={newRules}
                  onChange={e => setNewRules(e.target.value)}
                  size='md'
                  maxWidth='400px'
                  borderColor='gray.300'
                  _focus={{ borderColor: 'blue.500' }}
                />
                <Flex>
                  <Button
                    bg={primaryBtnBg}
                    color='white'
                    _hover={{ bg: primaryBtnHoverBg }}
                    _active={{ bg: primaryBtnActiveBg }}
                    onClick={handleEditNameAboutRules}
                    mr={3}>
                    Save
                  </Button>
                  <Button
                    bg={deleteBtnBg}
                    color='white'
                    _hover={{ bg: deleteBtnHoverBg }}
                    _active={{ bg: deleteBtnActiveBg }}
                    onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </Flex>
              </VStack>
            )}

            <Box mb={5}>
              <Box mb={5}>
                <CommunityQuestionHeader
                  titleText={titleText}
                  qcnt={qlist.length}
                  setQuestionOrder={setQuestionOrder}
                />
                <Box>
                  <QuestionStack questions={qlist} />
                </Box>
                {titleText === 'Search Results' && !qlist.length && (
                  <Text fontWeight='bold' pr={4}>
                    No Questions Found
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default CommunityPage;
