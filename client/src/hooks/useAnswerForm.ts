import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import addAnswer from '../services/answerService';
import useUserContext from './useUserContext';
import { Answer } from '../types/types';
import { createAnswerNotification } from '../services/notificationService';
import api from '../services/config';

const QUESTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/question`;

/**
 * Custom hook for managing the state and logic of an answer submission form.
 *
 * @returns text - the current text input for the answer.
 * @returns textErr - the error message related to the text input.
 * @returns setText - the function to update the answer text input.
 * @returns postAnswer - the function to submit the answer after validation.
 * @returns useMarkdown - whether the answer uses markdown.
 * @returns setUseMarkdown - function to update the markdown state.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');
  const [useMarkdown, setUseMarkdown] = useState(false);

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to post an answer to a question.
   * It validates the answer text and posts the answer if it is valid.
   */
  const postAnswer = async () => {
    let isValid = true;

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    // Hyperlink validation
    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
      comments: [],
      useMarkdown,
    };

    try {
      const res = await addAnswer(questionID, answer);
      if (res && res._id) {
        // Get the question to find the owner's username
        const questionRes = await api.get(
          `${QUESTION_API_URL}/getQuestionById/${questionID}?username=${user.username}`,
        );
        if (questionRes.status === 200) {
          const question = questionRes.data;
          // Create notification for the question owner
          await createAnswerNotification(
            questionID,
            res._id.toString(),
            user.username,
            question.askedBy,
            `${user.username} answered your question`,
          );
        }

        // navigate to the question that was answered
        navigate(`/question/${questionID}`);
      }
    } catch (error) {
      setTextErr('Failed to post answer. Please try again.');
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
    useMarkdown,
    setUseMarkdown,
  };
};

export default useAnswerForm;
