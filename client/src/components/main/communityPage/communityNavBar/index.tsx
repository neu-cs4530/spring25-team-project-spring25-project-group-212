import { HStack } from '@chakra-ui/react';
import { NavLink, useParams } from 'react-router-dom';
import './index.css';

const CommunityNavBar = () => {
  const { id } = useParams();
  return (
    <HStack>
      <NavLink
        to={`/community/${id}/`}
        id='home'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        end={true}>
        Home
      </NavLink>
      <NavLink
        to={`/community/${id}/bulletinBoard`}
        id='bulletin_board'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Bulletin Board
      </NavLink>
      <NavLink
        to={`/community/${id}/invites`}
        id='invites'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Invites
      </NavLink>
      <NavLink
        to={`/community/${id}/statistics`}
        id='statistics'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Statistics
      </NavLink>
    </HStack>
  );
};

export default CommunityNavBar;
