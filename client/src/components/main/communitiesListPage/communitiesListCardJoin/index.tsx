import React from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';

const CommunitiesListCardJoin = ({
  community,
  handleCommunityJoin,
  handleCommunityPreview,
}: {
  community: PopulatedDatabaseCommunity;
  handleCommunityJoin: (communityId: string | undefined) => void;
  handleCommunityPreview: (communityId: string | undefined) => void;
}) => (
  <div>
    <p>
      <strong>Community Name: </strong> {community.name}
    </p>
    <p>
      <strong>Community Rules: </strong> {community.rules}
    </p>
    <button onClick={() => handleCommunityJoin(community._id.toString())}>Join Community</button>
    <button onClick={() => handleCommunityPreview(community._id.toString())}>
      Preview Community
    </button>
  </div>
);

export default CommunitiesListCardJoin;
