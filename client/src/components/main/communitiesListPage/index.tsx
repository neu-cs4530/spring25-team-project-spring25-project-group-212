import useCommunitiesListPage from '../../../hooks/useCommunitiesListPage';
import CommunitiesListCard from './communitiesListCard';

const CommunitiesListPage = () => {
  const { communities, error, handleJoin, fetchCommunities } = useCommunitiesListPage();

  return (
    <div>
      {error && <div>{error}</div>}
      <h2>Communities</h2>
      <button onClick={fetchCommunities}>Refresh List</button>
      <div>
        {communities.map(c => (
          <CommunitiesListCard
            key={c._id.toString()}
            community={c}
            handleCommunityJoin={() => handleJoin(c._id.toString())}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunitiesListPage;
