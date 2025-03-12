import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Community } from '@fake-stack-overflow/shared';
import useUserContext from './useUserContext';
import { createCommunity } from '../services/communityService';

/**
 * Custom hook to handle community submission and form validation
 * @returns name - The current value of the name input.
 * @returns about - The current value of the about input.
 * @returns rules - The current value of the rules input.
 * @returns nameErr - Error message for the name field, if any.
 * @returns aboutErr - Error message for the about field, if any.
 * @returns rulesErr - Error message for the rules field, if any.
 * @returns postCommunity - Function to validate the form and submit a new community.
 */
const useNewCommunity = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [name, setName] = useState<string>('');
  const [about, setAbout] = useState<string>('');
  const [rules, setRules] = useState<string>('');

  const [err, setErr] = useState<string>('');
  const [nameErr, setNameErr] = useState<string>('');
  const [aboutErr, setAboutErr] = useState<string>('');
  const [rulesErr, setRulesErr] = useState<string>('');

  /**
   * Function to validate the form before submitting the community.
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!name) {
      setNameErr('Name cannot be empty');
      isValid = false;
    } else if (name.length > 100) {
      setNameErr('Name cannot be more than 100 characters');
      isValid = false;
    } else {
      setNameErr('');
    }

    if (!about) {
      setAboutErr('About cannot be empty');
      isValid = false;
    } else if (about.length > 500) {
      setAboutErr('About cannot be more than 500 characters');
      isValid = false;
    } else {
      setAboutErr('');
    }

    if (!rules) {
      setRulesErr('Rules cannot be empty');
      isValid = false;
    } else if (rules.length > 500) {
      setRulesErr('Rules cannot be more than 500 characters');
      isValid = false;
    } else {
      setRulesErr('');
    }

    return isValid;
  };

  /**
   * Function to submit the new community
   */
  const postCommunity = async () => {
    if (!validateForm()) return;

    const community: Omit<Community, 'groupChat' | 'questions'> = {
      name,
      about,
      rules,
      members: [user.username],
      createdBy: user.username,
    };

    const response = await createCommunity(community);

    if ('error' in response) {
      setErr('Could not create community');
      return;
    }

    navigate(`/community/${response._id}`);
  };

  return {
    name,
    setName,
    about,
    setAbout,
    rules,
    setRules,
    nameErr,
    aboutErr,
    rulesErr,
    postCommunity,
    err,
  };
};

export default useNewCommunity;
