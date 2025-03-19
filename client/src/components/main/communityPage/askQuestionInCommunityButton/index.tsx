import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Question" page. When clicked, it redirects the user to the page
 * where they can ask a new question.
 */
const AskQuestionInCommunityButton = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  /**
   * Function to handle navigation to the "New Question in Community" page.
   */
  const handleNewQuestion = () => {
    navigate(`/new/questionInCommunity/${id}`);
  };

  return (
    <button
      className='bluebtn'
      onClick={() => {
        handleNewQuestion();
      }}>
      Ask a Question
    </button>
  );
};

export default AskQuestionInCommunityButton;
