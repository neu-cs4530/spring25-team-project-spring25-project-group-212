import React, { useEffect } from 'react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';
import useUserContext from '../../../../hooks/useUserContext';
import useQuestion from '../../../../hooks/useQuestion';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };


  /**
   * Code snippet necessary to add saving and unsaving questions provided there is a questionId
   */
  const { user: currentUser } = useUserContext();
  const { handleToggleSaveQuestion, handleSetQuestionSaved, questionSaved } = useQuestion();
  useEffect(() => {
    handleSetQuestionSaved(currentUser.username, question._id.toString());
  }, [currentUser.username, question._id, handleSetQuestionSaved]);

  return (
    <div className='question right_padding'>
      <div
        className='question_content'
        onClick={() => {
          if (question._id) {
            handleAnswer(question._id);
          }
        }}>
        <div className='postStats'>
          <div>{question.answers.length || 0} answers</div>
          <div>{question.views.length} views</div>
        </div>
        <div className='question_mid'>
          <div className='postTitle'>{question.title}</div>
          <div className='question_tags'>
            {question.tags.map(tag => (
              <button
                key={String(tag._id)}
                className='question_tag_button'
                onClick={e => {
                  e.stopPropagation();
                  clickTag(tag.name);
                }}>
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div className='lastActivity'>
          <div className='question_author'>{question.askedBy}</div>
          <div>&nbsp;</div>
          <div className='question_meta'>asked {getMetaData(new Date(question.askDateTime))}</div>
        </div>
      </div>
      <div>
        {questionSaved ? (
          <button
            className='btn'
            onClick={() => handleToggleSaveQuestion(currentUser.username, question._id.toString())}>
            Unsave
          </button>
        ) : (
          <button
            className='btn'
            onClick={() => handleToggleSaveQuestion(currentUser.username, question._id.toString())}>
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionView;
