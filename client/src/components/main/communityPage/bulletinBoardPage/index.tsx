import { Tldraw, useEditor } from 'tldraw';
import { useSyncDemo } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import './index.css';
import useCommunityTabsHeader from '../../../../hooks/useCommunityTabsHeader';
import useBulletinBoardPage from '../../../../hooks/useBulletinBoardPage';
import CommunityNavBar from '../communityNavBar';

const BulletinBoardPage = () => {
  const { handleQuestionsAndChatTabClick, community } = useCommunityTabsHeader();
  const { handleBulletinBoardLoad, handleBulletinBoardSave, showCheckMark, setShowCheckMark } =
    useBulletinBoardPage();
  const store = useSyncDemo({ roomId: `${community?._id.toString()}` });
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
      <CommunityNavBar />
      <div
        style={{ position: 'relative', width: '100%', height: '600px', border: '1px solid #ccc' }}>
        <Tldraw store={store} components={{ SharePanel: SnapshotToolbar }} />
      </div>
    </div>
  );
};

export default BulletinBoardPage;
