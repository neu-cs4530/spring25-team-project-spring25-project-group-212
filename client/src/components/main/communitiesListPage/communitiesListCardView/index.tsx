import React from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';

const CommunitiesListCardView = ({
  community,
  handleCommunityJoin,
}: {
  community: PopulatedDatabaseCommunity;
  handleCommunityJoin: (communityId: string | undefined) => void;
}) => (
  <div>
    <p>
      <strong>Community Name: </strong> {community.name}
    </p>
    <p>
      <strong>Community Rules: </strong> {community.rules}
    </p>
    <button onClick={() => handleCommunityJoin(community._id.toString())}>View Community</button>
  </div>
);

export default CommunitiesListCardView;
