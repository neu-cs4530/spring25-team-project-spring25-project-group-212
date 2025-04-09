import { HStack } from '@chakra-ui/react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import './index.css';

const CommunityNavBar = () => {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  return (
    <HStack>
      <NavLink
        to={`/community/${id}?${searchParams.toString()}`}
        id='home'
        className={({ isActive }) =>
          `community_menu_button ${isActive ? 'community_menu_selected' : ''}`
        }
        end={true}>
        Home
      </NavLink>
      <NavLink
        to={`/community/${id}/bulletinBoard?${searchParams.toString()}`}
        id='bulletin_board'
        className={({ isActive }) =>
          `community_menu_button ${isActive ? 'community_menu_selected' : ''}`
        }>
        Bulletin Board
      </NavLink>
      <NavLink
        to={`/community/${id}/invites?${searchParams.toString()}`}
        id='invites'
        className={({ isActive }) =>
          `community_menu_button ${isActive ? 'community_menu_selected' : ''}`
        }>
        Invites
      </NavLink>
      <NavLink
        to={`/community/${id}/chat?${searchParams.toString()}`}
        id='chat'
        className={({ isActive }) =>
          `community_menu_button ${isActive ? 'community_menu_selected' : ''}`
        }>
        Chat
      </NavLink>
      <NavLink
        to={`/community/${id}/statistics?${searchParams.toString()}`}
        id='statistics'
        className={({ isActive }) =>
          `community_menu_button ${isActive ? 'community_menu_selected' : ''}`
        }>
        Statistics
      </NavLink>
    </HStack>
  );
};

export default CommunityNavBar;
