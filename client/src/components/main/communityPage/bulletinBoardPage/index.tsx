import { Tldraw, useEditor } from 'tldraw';
import { useSyncDemo } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import './index.css';
import useCommunityTabsHeader from '../../../../hooks/useCommunityTabsHeader';
import useBulletinBoardPage from '../../../../hooks/useBulletinBoardPage';
import useUserContext from '../../../../hooks/useUserContext';

const BulletinBoardPage = () => {
  const { user } = useUserContext();
  const { handleQuestionsAndChatTabClick, community } = useCommunityTabsHeader();
  const { handleBulletinBoardLoad, handleBulletinBoardSave, showCheckMark, setShowCheckMark } =
    useBulletinBoardPage();
  const store = useSyncDemo({ roomId: `${community?._id.toString()}` });
  if (community === undefined || community === null) {
    return <div>Loading...</div>;
  }
  const isUserInCommunity = community.members.includes(user.username);
  function SnapshotToolbar() {
    const editor = useEditor();
    return (
      <div style={{ padding: 20, pointerEvents: 'all', display: 'flex', gap: '10px' }}>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
            transform: showCheckMark ? `scale(1)` : `scale(0.5)`,
            opacity: showCheckMark ? 1 : 0,
          }}>
          Saved ✅
        </span>
        <button
          onClick={() => {
            handleBulletinBoardSave(editor);
            setShowCheckMark(true);
          }}>
          Save Snapshot
        </button>
        <button onClick={() => handleBulletinBoardLoad(editor)}>Load Snapshot</button>
      </div>
    );
  }
  return (
    <div id='bulletin-board-page'>
      <button className='login-button' onClick={handleQuestionsAndChatTabClick}>
        Questions and Chat
      </button>
      <div
        style={{ position: 'relative', width: '100%', height: '800px', border: '1px solid #ccc' }}>
        {isUserInCommunity ? (
          <Tldraw
            store={store}
            components={{ SharePanel: SnapshotToolbar }}
            options={{ maxPages: 1 }}
          />
        ) : (
          <Tldraw
            store={store}
            onMount={editor => {
              editor.updateInstanceState({ isReadonly: true });
            }}
            options={{ maxPages: 1 }}
          />
        )}
      </div>
    </div>
  );
};

export default BulletinBoardPage;
