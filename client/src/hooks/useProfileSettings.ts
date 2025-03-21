import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  updateEmail,
} from '../services/userService';
import { PopulatedDatabaseQuestion, SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';
import { getQuestionsByFilter } from '../services/questionService';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [topVotedQuestion, setTopVotedQuestion] = useState<PopulatedDatabaseQuestion | null>(null);
  const [topVotedCount, setTopVotedCount] = useState(0);
  const [topViewedQuestion, setTopViewedQuestion] = useState<PopulatedDatabaseQuestion | null>(
    null,
  );
  const [topViewedCount, setTopViewedCount] = useState(0);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    if (!username) {
      setTopVotedQuestion(null);
      setTopViewedQuestion(null);
    }

    const fetchQuestions = async () => {
      const allQuestions = await getQuestionsByFilter();
      let topVoted = null;
      let topVotedVotes = -Infinity;
      let topViewed = null;
      let topViewedViews = -Infinity;

      allQuestions.forEach(question => {
        if (
          (question.askedBy === username && question.anonymous === false) ||
          question.answers.some(ans => ans.ansBy === username)
        ) {
          const netVotes = question.upVotes.length - question.downVotes.length;
          if (netVotes > topVotedVotes) {
            topVotedVotes = netVotes;
            topVoted = question;
          }

          const viewsCount = question.views.length;
          if (viewsCount > topViewedViews) {
            topViewedViews = viewsCount;
            topViewed = question;
          }
        }
      });

      setTopVotedQuestion(topVoted);
      setTopVotedCount(topVotedVotes);
      setTopViewedQuestion(topViewed);
      setTopViewedCount(topViewedViews);
    };

    fetchQuestions();
  }, [username]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for update the user email
   */
  const handleUpdateEmail = async () => {
    if (!username) return;
    try {
      // Await the async call to update the email
      const updatedUser = await updateEmail(username, newEmail);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditEmailMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Email updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update email.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  return {
    userData,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    setEditBioMode,
    newBio,
    setNewBio,
    editEmailMode,
    setEditEmailMode,
    newEmail,
    setNewEmail,
    successMessage,
    errorMessage,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleUpdateEmail,
    handleDeleteUser,
    topVotedQuestion,
    topVotedCount,
    topViewedQuestion,
    topViewedCount,
  };
};

export default useProfileSettings;
