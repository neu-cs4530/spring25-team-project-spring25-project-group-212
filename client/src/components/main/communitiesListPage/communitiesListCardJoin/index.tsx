import React from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';

const CommunitiesListCardJoin = ({
  community,
  handleCommunityJoin,
  handleCommunityPreview,
}: {
  community: PopulatedDatabaseCommunity;
  handleCommunityJoin: (communityId: string | undefined) => void;
  handleCommunityPreview: (communityId: string | undefined) => void;
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <p>
        <strong>Community Name: </strong> {community.name}
      </p>
      <p>
        <strong>Community Rules: </strong> {community.rules}
      </p>
      <button onClick={() => handleCommunityJoin(community._id.toString())}>Join Community</button>
      <button
        onClick={() =>
          navigate(`/community/${community._id.toString()}`, {
            state: { isPreview: true }, // Pass `isPreview` state
          })
        }>
        Preview Community
      </button>
    </div>
  );
};
export default CommunitiesListCardJoin;
