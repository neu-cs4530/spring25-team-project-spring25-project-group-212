import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';
import useUserContext from '../../../hooks/useUserContext';
import { joinCommunity } from '../../../services/communityService';
import useCommunityNameAboutRules from '../../../hooks/useCommunityNameAboutRules';
import './index.css';
import CommunityNavBar from './communityNavBar';
import QuestionStack from '../questionPage/questionStack';

const CommunityPage = () => {
  const { titleText, qlist, setQuestionOrder } = useCommunityQuestionPage();
  const location = useLocation();
  const isPreview = location.state?.isPreview || false;

  const {
    community,
    editMode,
    setEditMode,
    newName,
    setNewName,
    newAbout,
    setNewAbout,
    newRules,
    setNewRules,
    handleEditNameAboutRules,
    canEditNameAboutRules,
    communityExistsError,
  } = useCommunityNameAboutRules();

  const { user, socket } = useUserContext();

  useEffect(() => {
    if (!community || !user || !socket) return undefined;

    const userHasJoinedCommunity = community.members.includes(user.username);

    if (!userHasJoinedCommunity && !isPreview) {
      socket.emit('joinCommunity', community._id.toString(), user.username);
      joinCommunity(community._id.toString(), user.username);
    }

    return () => {
      if (userHasJoinedCommunity) {
        socket.emit('leaveCommunity', community._id.toString(), user.username);
      }
    };
  }, [community, user, socket, isPreview]);

  if (!community || !community) {
    return <div>Loading...</div>;
  }
  const userHasJoinedCommunity = community.members.includes(user.username);
  return (
    <>
      {communityExistsError !== '' ? (
        <strong>{communityExistsError}</strong>
      ) : (
        <>
          {' '}
          <div id='community-page'>
            <CommunityNavBar />
            {!editMode && (
              <div>
                <strong>Community Name: </strong> {community.name}
                <p>
                  <strong>About: </strong>
                  {community.about}
                </p>
                <p>
                  <strong>Rules: </strong>
                  {community.rules}
                </p>
                {userHasJoinedCommunity && canEditNameAboutRules && (
                  <button
                    className='login-button'
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                      setEditMode(true);
                      setNewName(community?.name || '');
                      setNewAbout(community?.about || '');
                      setNewRules(community?.rules || '');
                    }}>
                    Edit Name, About, and/or Rules
                  </button>
                )}
              </div>
            )}
            {userHasJoinedCommunity && editMode && canEditNameAboutRules && (
              <div>
                <input
                  className='input-text'
                  placeholder='Enter new name...'
                  type='text'
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
                <input
                  className='input-text'
                  placeholder='Enter new about...'
                  type='text'
                  value={newAbout}
                  onChange={e => setNewAbout(e.target.value)}
                />
                <input
                  className='input-text'
                  placeholder='Enter new rules...'
                  type='text'
                  value={newRules}
                  onChange={e => setNewRules(e.target.value)}
                />
                <button
                  className='login-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={handleEditNameAboutRules}>
                  Save
                </button>
                <button
                  className='delete-button'
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            )}
            <div id='community-content'>
              <div id='community-questions' style={{ marginBottom: 20 }}>
                <CommunityQuestionHeader
                  titleText={titleText}
                  qcnt={qlist.length}
                  setQuestionOrder={setQuestionOrder}
                />
                <div id='question_list' className='question_list'>
                  <QuestionStack questions={qlist} />
                </div>
                {titleText === 'Search Results' && !qlist.length && (
                  <div className='bold_title right_padding'>No Questions Found</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CommunityPage;
