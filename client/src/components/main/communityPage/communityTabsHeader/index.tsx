import useCommunityTabsHeader from '../../../../hooks/useCommunityTabsHeader';
import './index.css';

const CommunityTabsHeader = () => {
  const { handleQuestionsAndChatTabClick, handleBulletinBoardTabClick } = useCommunityTabsHeader();

  return (
    <div id='communityTabsHeader'>
      <button className='login-button' onClick={handleQuestionsAndChatTabClick}>
        Questions and Community Group Chat
      </button>
      <button className='login-button' onClick={handleBulletinBoardTabClick}>
        Bulletin Board
      </button>
    </div>
  );
};

export default CommunityTabsHeader;
