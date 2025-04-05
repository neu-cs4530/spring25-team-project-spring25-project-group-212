import { Tldraw, useEditor } from 'tldraw';
import { useSyncDemo } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import './index.css';
import { JaaSMeeting } from '@jitsi/react-sdk';
import { useState } from 'react';
import { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types';
import useCommunityTabsHeader from '../../../../hooks/useCommunityTabsHeader';
import useBulletinBoardPage from '../../../../hooks/useBulletinBoardPage';
import useUserContext from '../../../../hooks/useUserContext';

const BulletinBoardPage = () => {
  const { user } = useUserContext();
  const [isInCall, setIsInCall] = useState(true);
  const { handleQuestionsAndChatTabClick, community } = useCommunityTabsHeader();
  const { handleBulletinBoardLoad, handleBulletinBoardSave, showCheckMark, setShowCheckMark } =
    useBulletinBoardPage();
  const store = useSyncDemo({ roomId: `${community?._id.toString()}` });

  const handleApiReady = (externalApi: IJitsiMeetExternalApi) => {
    externalApi.addListener('videoConferenceJoined', () => {
      setIsInCall(true);
    });

    externalApi.addListener('videoConferenceLeft', () => {
      setIsInCall(false);
    });
  };
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
    <div id='bulletin-board-page' style={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc', overflow: 'hidden' }}>
        <button className='login-button' onClick={handleQuestionsAndChatTabClick}>
          Questions and Chat
        </button>
        {isUserInCommunity ? (
          <Tldraw
            store={store}
            components={{ SharePanel: SnapshotToolbar }}
            options={{ maxPages: 1 }}
          />
        ) : (
          <Tldraw store={store} hideUi={true} />
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isInCall ? (
          <JaaSMeeting
            appId='vpaas-magic-cookie-be21d63d5af64179a3267d06a7e829f0'
            roomName={community._id.toString()}
            getIFrameRef={iframeRef => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
            onApiReady={handleApiReady}
          />
        ) : (
          <div>
            <p>Call ended. Click below to rejoin.</p>
            <button onClick={() => setIsInCall(true)}>Join Call</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinBoardPage;
