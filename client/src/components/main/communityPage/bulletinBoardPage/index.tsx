import { Tldraw, useEditor } from 'tldraw';
import { useSyncDemo } from '@tldraw/sync';
import 'tldraw/tldraw.css';
import './index.css';
import { JaaSMeeting } from '@jitsi/react-sdk';
import { useState } from 'react';
import { IJitsiMeetExternalApi } from '@jitsi/react-sdk/lib/types';
import { useParams } from 'react-router-dom';
import useBulletinBoardPage from '../../../../hooks/useBulletinBoardPage';
import useUserContext from '../../../../hooks/useUserContext';
import CommunityNavBar from '../communityNavBar';

const BulletinBoardPage = () => {
  const { user } = useUserContext();
  const [isInCall, setIsInCall] = useState(true);
  const { id } = useParams();
  const {
    handleBulletinBoardLoad,
    handleBulletinBoardSave,
    showCheckMark,
    setShowCheckMark,
    bulletinBoardError,
    community,
  } = useBulletinBoardPage();
  const store = useSyncDemo({ roomId: `${id?.toString()}` });

  const handleApiReady = (externalApi: IJitsiMeetExternalApi) => {
    externalApi.addListener('videoConferenceJoined', () => {
      setIsInCall(true);
    });

    externalApi.addListener('videoConferenceLeft', () => {
      setIsInCall(false);
    });
  };
  const isUserInCommunity = community && community.members.includes(user.username);
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
    <>
      {bulletinBoardError !== '' ? (
        <strong>{bulletinBoardError}</strong>
      ) : (
        <div>
          <CommunityNavBar />
          <div
            id='bulletin-board-page'
            style={{ display: 'flex', flexDirection: 'row', height: '80vh' }}>
            <div
              className='tldraw__editor'
              style={{ flex: 1, borderRight: '1px solid #ccc', overflow: 'hidden' }}>
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
            {isUserInCommunity && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {isInCall ? (
                  <JaaSMeeting
                    appId='vpaas-magic-cookie-be21d63d5af64179a3267d06a7e829f0'
                    roomName={community ? community._id.toString() : 'error retrieving community'}
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
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BulletinBoardPage;
