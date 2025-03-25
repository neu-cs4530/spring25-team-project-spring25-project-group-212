import React, { useEffect, useState } from 'react';
import './index.css';
import { useNavigate, useLocation } from 'react-router-dom';
import Popup from 'reactjs-popup';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';
import useUserContext from '../../../hooks/useUserContext';

/**
 * QuestionPage component renders a page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a header with order buttons and a button to ask a new question.
 */
const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useUserContext();
  const [emailPopUpOpen, setEmailPopUpOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('emailPopup') === 'open' && !currentUser.email) {
      setEmailPopUpOpen(true);
    }
  }, [location, currentUser, navigate]);

  return (
    <>
      <Popup open={emailPopUpOpen} onClose={() => setEmailPopUpOpen(false)}>
        <div className='email_popup'>
          <h2>Your Email is missing!</h2>
          <div>Add youre email to receive daily emails from Fake Stack Overflow</div>
          <button className='btn' onClick={() => setEmailPopUpOpen(false)}>
            Ignore
          </button>
          <button className='btn' onClick={() => navigate(`/user/${currentUser.username}`)}>
            Add Email
          </button>
        </div>
      </Popup>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />
      <div id='question_list' className='question_list'>
        {qlist.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </div>
      {titleText === 'Search Results' && !qlist.length && (
        <div className='bold_title right_padding'>No Questions Found</div>
      )}
    </>
  );
};

export default QuestionPage;
