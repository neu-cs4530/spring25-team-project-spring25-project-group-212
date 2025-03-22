import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import './index.css';
import useCommunityTabsHeader from '../../../../hooks/useCommunityTabsHeader';

const BulletinBoardPage = () => {
  const { handleQuestionsAndChatTabClick } = useCommunityTabsHeader();

  return (
    <div id='bulletin-board'>
      <button className='login-button' onClick={handleQuestionsAndChatTabClick}>
        Questions and Chat
      </button>
      <div
        style={{ position: 'relative', width: '100%', height: '600px', border: '1px solid #ccc' }}>
        <Tldraw persistenceKey='my-persistence-key' />
      </div>
    </div>
  );
};

export default BulletinBoardPage;
