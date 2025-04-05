import React from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useProfileSettings from '../../hooks/useProfileSettings';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    editEmailMode,
    newEmail,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,

    setEditEmailMode,
    setEditBioMode,
    setNewBio,
    setNewEmail,
    setNewPassword,
    setConfirmNewPassword,

    handleResetPassword,
    handleUpdateBiography,
    handleUpdateEmail,
    handleDeleteUser,

    topVotedQuestion,
    topVotedCount,
    topViewedQuestion,
    topViewedCount,

    handleUserInvites,
  } = useProfileSettings();

  const navigate = useNavigate();
  const { open, onOpen, onClose } = useDisclosure();

  if (loading) {
    return (
      <Box className='page-container' p={4}>
        <Box className='profile-card' p={6} borderWidth='1px' borderRadius='md' boxShadow='md'>
          <Heading size='md'>Loading user data...</Heading>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className='page-container' p={4}>
        <Box className='profile-card' p={6} borderWidth='1px' borderRadius='md' boxShadow='md'>
          <Grid templateRows='repeat(2, 1fr)' templateColumns='repeat(5, 1fr)' gap={4}>
            <GridItem rowSpan={1} colSpan={5}>
              <Box>
                <Heading size='lg' mb={4}>
                  Profile
                </Heading>
              </Box>
            </GridItem>
            <GridItem rowSpan={1} colSpan={5}>
              <Box>
                {successMessage && <Text color='green.500'>{successMessage}</Text>}
                {errorMessage && <Text color='red.500'>{errorMessage}</Text>}
              </Box>
            </GridItem>
            {userData ? (
              <>
                <GridItem rowSpan={4} colSpan={1}>
                  <Box>
                    <Heading size='sm'>General Information</Heading>
                  </Box>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text>
                    <strong>Username:</strong> {userData.username}
                  </Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Text>
                    <strong>Date Joined:</strong>{' '}
                    {userData.dateJoined
                      ? new Date(userData.dateJoined).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </GridItem>
                {/* ---- Biography Section ---- */}
                <GridItem colSpan={2}>
                  <Text>
                    <strong>Biography:</strong>{' '}
                    {!editBioMode ? (
                      <>
                        {userData.biography || 'No biography yet.'}
                        {canEditProfile && (
                          <Button
                            size='xs'
                            ml={4}
                            variant='outline'
                            colorPalette='blue'
                            onClick={() => {
                              setEditBioMode(true);
                              setNewBio(userData.biography || '');
                            }}>
                            Edit
                          </Button>
                        )}
                      </>
                    ) : (
                      <VStack align='start' p={2}>
                        <Input
                          value={newBio}
                          onChange={e => setNewBio(e.target.value)}
                          placeholder='Enter your biography'
                        />
                        <HStack>
                          <Button
                            size='xs'
                            colorPalette='blue'
                            variant='outline'
                            onClick={handleUpdateBiography}>
                            Save
                          </Button>
                          <Button
                            size='xs'
                            colorPalette='red'
                            variant='outline'
                            onClick={() => setEditBioMode(false)}>
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </Text>
                </GridItem>
                {/* ---- Email Section ---- */}
                <GridItem colSpan={2}>
                  <Text>
                    <strong>Email:</strong>{' '}
                    {!editEmailMode ? (
                      <>
                        {userData.email || 'No email provided.'}
                        {canEditProfile && (
                          <Button
                            size='xs'
                            ml={4}
                            variant='outline'
                            colorPalette='blue'
                            onClick={() => {
                              setEditEmailMode(true);
                              setNewEmail(userData.email || '');
                            }}>
                            Edit
                          </Button>
                        )}
                      </>
                    ) : (
                      <VStack align='start' p={2}>
                        <Input
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          placeholder='Enter your email'
                        />
                        <Text fontSize='sm' color='gray.500'>
                          By providing your email, you agree to receive daily emails from
                          Fake-Stack-Overflow.
                        </Text>
                        <HStack>
                          <Button
                            size='xs'
                            colorPalette='blue'
                            variant='outline'
                            onClick={handleUpdateEmail}>
                            Save
                          </Button>
                          <Button
                            size='xs'
                            colorPalette='red'
                            variant='outline'
                            onClick={() => setEditEmailMode(false)}>
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </Text>
                </GridItem>

                {/* ---- Top Questions Section ---- */}
                <GridItem colSpan={2}>
                  <Text>
                    <strong>Top Voted Question:</strong>{' '}
                    {topVotedQuestion ? (
                      <Text
                        as='span'
                        color='blue.500'
                        cursor='pointer'
                        onClick={() => navigate(`/question/${topVotedQuestion._id}`)}>
                        {topVotedQuestion.title} ({topVotedCount} votes)
                      </Text>
                    ) : (
                      'No questions asked yet.'
                    )}
                  </Text>
                </GridItem>

                <GridItem colSpan={2}>
                  <Text>
                    <strong>Top Viewed Question:</strong>{' '}
                    {topViewedQuestion ? (
                      <Text
                        as='span'
                        color='blue.500'
                        cursor='pointer'
                        onClick={() => navigate(`/question/${topViewedQuestion._id}`)}>
                        {topViewedQuestion.title} ({topViewedCount} views)
                      </Text>
                    ) : (
                      'No questions asked yet.'
                    )}
                  </Text>
                </GridItem>

                <GridItem colSpan={4}>
                  {canEditProfile && (
                    <Button
                      size='xs'
                      ml={0}
                      colorPalette='blue'
                      variant='outline'
                      onClick={handleUserInvites}>
                      View Community Invites
                    </Button>
                  )}
                </GridItem>

                {/* ---- Reset Password Section ---- */}
                {canEditProfile && (
                  <>
                    <GridItem rowSpan={2} colSpan={1}>
                      <Heading size='sm'>Reset Password</Heading>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='New Password'
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Confirm New Password'
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                      />
                    </GridItem>
                    <GridItem colSpan={4}>
                      <Button
                        size='xs'
                        ml={0}
                        variant='outline'
                        colorPalette='blue'
                        onClick={togglePasswordVisibility}>
                        {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                      </Button>
                      <Button size='xs' colorPalette='red' onClick={handleResetPassword}>
                        Reset
                      </Button>
                    </GridItem>
                  </>
                )}

                {/* ---- Danger Zone ---- */}
                {canEditProfile && (
                  <>
                    <GridItem rowSpan={1} colSpan={1}>
                      <Heading size='sm' color='red.500'>
                        Danger Zone
                      </Heading>
                    </GridItem>
                    <GridItem colSpan={4}>
                      <Button
                        size='xs'
                        ml={0}
                        colorPalette='red'
                        onClick={() => {
                          onOpen();
                          handleDeleteUser();
                        }}>
                        Delete This User
                      </Button>
                    </GridItem>
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
                        <Text mb={4}>
                          Are you sure you want to delete user <strong>{userData?.username}</strong>
                          ? This action cannot be undone.
                        </Text>
                        <HStack p={4}>
                          <Button
                            colorPalette='red'
                            onClick={() => {
                              if (pendingAction) {
                                pendingAction();
                              }
                              onClose();
                            }}>
                            Confirm
                          </Button>
                          <Button colorPalette='blue' variant='outline' onClick={onClose}>
                            Cancel
                          </Button>
                        </HStack>
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <GridItem>
                <Text>No user data found. Make sure the username parameter is correct.</Text>
              </GridItem>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ProfileSettings;
