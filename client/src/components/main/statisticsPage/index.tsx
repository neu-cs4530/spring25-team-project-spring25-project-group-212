import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';
import useStatisticsPage from '../../../hooks/useStatisticsPage';
import StatisticsHeader from './header';
import QuestionStack from '../questionPage/questionStack';
import UserStack from '../usersListPage/userStack';

/**
 * StatisticsPage component renders a page displaying a list of statistics
 * for top questions and users.
 */
const StatisticsPage = () => {
  const {
    topVotedQuestions,
    topViewedQuestions,
    topVotedQuestionVotes,
    topViewedQuestionViews,
    topAskingUsers,
    topViewingUsers,
    topVotingUsers,
    topAnsweringUsers,
    topViewerCount,
    topVoterCount,
    topAskerQuestionCount,
    topAnswererAnswerCount,
  } = useStatisticsPage();

  const navigate = useNavigate();

  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  return (
    <>
      <StatisticsHeader />
      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most questions asked by ${topAskingUsers.length > 1 ? 'users' : 'a user'}: ${topAskerQuestionCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <UserStack
          users={topAskingUsers}
          handleUserCardViewClickHandler={handleUserCardViewClickHandler}
        />
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Asking User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most answers made by ${topAnsweringUsers.length > 1 ? 'users' : 'a user'}: ${topAnswererAnswerCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <UserStack
          users={topAnsweringUsers}
          handleUserCardViewClickHandler={handleUserCardViewClickHandler}
        />
      </div>
      {(!topAnsweringUsers.length || topAnsweringUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Answering User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most votes cast by ${topVotingUsers.length > 1 ? 'users' : 'a user'}: ${topVoterCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <UserStack
          users={topVotingUsers}
          handleUserCardViewClickHandler={handleUserCardViewClickHandler}
        />
      </div>
      {(!topVotingUsers.length || topVotingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Voting User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most questions viewed by ${topViewingUsers.length > 1 ? 'users' : 'a user'}: ${topViewerCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <UserStack
          users={topViewingUsers}
          handleUserCardViewClickHandler={handleUserCardViewClickHandler}
        />
      </div>
      {(!topViewingUsers.length || topViewingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Viewing User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most viewed ${topViewedQuestions.length > 1 ? 'questions' : 'question'}: ${topViewedQuestionViews} views`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <QuestionStack questions={topViewedQuestions} />
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Most Viewed Question Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The best voted ${topVotedQuestions.length > 1 ? 'questions' : 'question'}: ${topVotedQuestionVotes}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        <QuestionStack questions={topVotedQuestions} />
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Best Voted Question Found</div>
      )}
    </>
  );
};

export default StatisticsPage;
