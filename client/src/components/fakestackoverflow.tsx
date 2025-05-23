import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout';
import Login from './auth/login';
import { FakeSOSocket, SafeDatabaseUser } from '../types/types';
import LoginContext from '../contexts/LoginContext';
import UserContext from '../contexts/UserContext';
import QuestionPage from './main/questionPage';
import TagPage from './main/tagPage';
import NewQuestionPage from './main/newQuestion';
import NewAnswerPage from './main/newAnswer';
import AnswerPage from './main/answerPage';
import MessagingPage from './main/messagingPage';
import DirectMessage from './main/directMessage';
import Signup from './auth/signup';
import UsersListPage from './main/usersListPage';
import ProfileSettings from './profileSettings';
import AllGamesPage from './main/games/allGamesPage';
import GamePage from './main/games/gamePage';
import NewCommunityPage from './main/newCommunity';
import CommunityPage from './main/communityPage';
import NewQuestionInCommunityPage from './main/communityPage/newQuestionInCommunity';
import CommunitiesListPage from './main/communitiesListPage';
import StatisticsPage from './main/statisticsPage';
import BulletinBoardPage from './main/communityPage/bulletinBoardPage';
import UserCommunityInvitesPage from './profileSettings/userCommunityInvitesPage';
import CommunityInvitesPage from './main/communityPage/communityInvitesPage';
import CommunityStatisticsPage from './main/communityPage/communityStatistics';
import CommunityChat from './main/communityPage/communityChat';

const ProtectedRoute = ({
  user,
  socket,
  children,
}: {
  user: SafeDatabaseUser | null;
  socket: FakeSOSocket | null;
  children: JSX.Element;
}) => {
  if (!user || !socket) {
    return <Navigate to='/' />;
  }

  return <UserContext.Provider value={{ user, socket }}>{children}</UserContext.Provider>;
};

/**
 * Represents the main component of the application.
 * It manages the state for search terms and the main title.
 */
const FakeStackOverflow = ({ socket }: { socket: FakeSOSocket | null }) => {
  const [user, setUser] = useState<SafeDatabaseUser | null>(null);

  return (
    <LoginContext.Provider value={{ setUser }}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        {/* Protected Routes */}
        {
          <Route
            element={
              <ProtectedRoute user={user} socket={socket}>
                <Layout />
              </ProtectedRoute>
            }>
            <Route path='/home' element={<QuestionPage />} />
            <Route path='tags' element={<TagPage />} />
            <Route path='/messaging' element={<MessagingPage />} />
            <Route path='/messaging/direct-message' element={<DirectMessage />} />
            <Route path='/question/:qid' element={<AnswerPage />} />
            <Route path='/new/question' element={<NewQuestionPage />} />
            <Route path='/new/answer/:qid' element={<NewAnswerPage />} />
            <Route path='/users' element={<UsersListPage />} />
            <Route path='/user/:username' element={<ProfileSettings />} />
            <Route path='/games' element={<AllGamesPage />} />
            <Route path='/games/:gameID' element={<GamePage />} />
            <Route path='/new/community' element={<NewCommunityPage />} />
            <Route path='/community/:id' element={<CommunityPage />} />
            <Route path='/new/questionInCommunity/:id' element={<NewQuestionInCommunityPage />} />
            <Route path='/community' element={<Navigate to='/community/list' replace />} />
            <Route path='/community/list' element={<CommunitiesListPage />} />
            <Route path='/statistics' element={<StatisticsPage />} />
            <Route path='/community/:id/bulletinBoard' element={<BulletinBoardPage />} />
            <Route path='/user/:username/communityInvites' element={<UserCommunityInvitesPage />} />
            <Route path='/community/:id/invites' element={<CommunityInvitesPage />} />
            <Route path='/community/:id/statistics' element={<CommunityStatisticsPage />} />
            <Route path='/community/:id/chat' element={<CommunityChat />} />
          </Route>
        }
      </Routes>
    </LoginContext.Provider>
  );
};

export default FakeStackOverflow;
