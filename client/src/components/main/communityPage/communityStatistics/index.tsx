import { useNavigate } from 'react-router-dom';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import useCommunityStatisticsPage from '../../../../hooks/useCommunityStatisticsPage';
import UserCardView from '../../usersListPage/userCard';
import QuestionView from '../../questionPage/question';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

const CommunityStatisticsPage = () => {
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
    questionData,
    memberData,
  } = useCommunityStatisticsPage();

  const navigate = useNavigate();

  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  return (
    <>
      <div className='space_between right_padding'>
        <div className='bold_title'>Community Statistics</div>
      </div>
      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most questions asked by ${topAskingUsers.length > 1 ? 'users' : 'a user'}: ${topAskerQuestionCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topAskingUsers.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Asking User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most answers made by ${topAnsweringUsers.length > 1 ? 'users' : 'a user'}: ${topAnswererAnswerCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topAnsweringUsers.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </div>
      {(!topAnsweringUsers.length || topAnsweringUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Answering User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most votes cast by ${topVotingUsers.length > 1 ? 'users' : 'a user'}: ${topVoterCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topVotingUsers.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </div>
      {(!topVotingUsers.length || topVotingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Voting User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most questions viewed by ${topViewingUsers.length > 1 ? 'users' : 'a user'}: ${topViewerCount}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topViewingUsers.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </div>
      {(!topViewingUsers.length || topViewingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Top Viewing User Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The most viewed ${topViewedQuestions.length > 1 ? 'questions' : 'question'}: ${topViewedQuestionViews} views`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topViewedQuestions.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Most Viewed Question Found</div>
      )}

      <div className='right_bottom_padding'>
        <div className='not_quite_so_bold_title'>{`The best voted ${topVotedQuestions.length > 1 ? 'questions' : 'question'}: ${topVotedQuestionVotes}`}</div>
      </div>
      <div id='users_list' className='users_list'>
        {topVotedQuestions.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </div>
      {(!topAskingUsers.length || topAskingUsers.length === 0) && (
        <div className='bold_title right_padding'>No Best Voted Question Found</div>
      )}
      <div>
        <h2>Question Count Over Time</h2>
        <Line data={questionData} />
      </div>
      <div>
        <h2>Member Count Over Time</h2>
        <Line data={memberData} />
      </div>
    </>
  );
};

export default CommunityStatisticsPage;
