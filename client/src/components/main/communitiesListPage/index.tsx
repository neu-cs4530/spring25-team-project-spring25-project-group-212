import useCommunitiesListPage from '../../../hooks/useCommunitiesListPage';
import useUserContext from '../../../hooks/useUserContext';
import CommunitiesListCardJoin from './communitiesListCardJoin';
import CommunitiesListCardView from './communitiesListCardView';

const CommunitiesListPage = () => {
  const { communities, error, handleJoin, fetchCommunities, handleCreateCommunity } =
    useCommunitiesListPage();
  const { user } = useUserContext();

  const joinedCommunities = communities.filter(c => c.members.includes(user.username));
  const unjoinedCommunities = communities.filter(c => !c.members.includes(user.username));

  return (
    <div>
      {error && <div>{error}</div>}
      <h2>Communities</h2>
      <button onClick={fetchCommunities}>Refresh List</button>
      <button onClick={handleCreateCommunity}>Create Community</button>
      <div>
        <strong>Joined Communities: </strong>
        {joinedCommunities.map(c => (
          <CommunitiesListCardView
            key={c._id.toString()}
            community={c}
            handleCommunityJoin={() => handleJoin(c._id.toString())}
          />
        ))}
      </div>
      <div>
        <strong>Other Communities: </strong>
        {unjoinedCommunities.map(c => (
          <CommunitiesListCardJoin
            key={c._id.toString()}
            community={c}
            handleCommunityJoin={() => handleJoin(c._id.toString())}
          />
        ))}
      </div>
      <div></div>
    </div>
  );
};

export default CommunitiesListPage;
