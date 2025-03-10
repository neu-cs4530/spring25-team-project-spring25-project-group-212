import { useState } from 'react';
import { getUserByUsername, toggleSaveQuestion } from '../services/userService';

const useQuestion = () => {
  const [questionSaved, setQuestionSaved] = useState<boolean>();

  const handleSetQuestionSaved = async (userName: string, qid: string) => {
    try {
      const user = await getUserByUsername(userName);
      setQuestionSaved(user.savedQuestions.includes(qid));
    } catch {
      setQuestionSaved(questionSaved);
    }
  };

  const handleToggleSaveQuestion = async (username: string, qid: string) => {
    try {
      await toggleSaveQuestion(username, qid);
    } catch {
      return;
    }
    handleSetQuestionSaved(username, qid);
  };

  return {
    handleToggleSaveQuestion,
    handleSetQuestionSaved,
    questionSaved,
  };
};

export default useQuestion;
