import express, { Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';

import {
  Community,
  CreateCommunityRequest,
  CommunityResponse,
  FakeSOSocket,
  CommunitiesResponse,
} from '../types/types';
import { saveCommunity, getCommunityById, getAllCommunities } from '../services/community.service';

const communityController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a community.
   * @param req The incoming request containing community data.
   * @returns `true` if the body contains valid community fields; otherwise, `false`.
   */
  const isCommunityBodyValid = (req: CreateCommunityRequest): boolean =>
    req.body !== undefined &&
    req.body.community !== undefined &&
    req.body.community.name !== undefined &&
    req.body.community.name !== '' &&
    req.body.community.about !== undefined &&
    req.body.community.about !== '' &&
    req.body.community.rules !== undefined &&
    req.body.community.rules !== '' &&
    req.body.community.members !== undefined &&
    Array.isArray(req.body.community.members) &&
    req.body.community.createdBy !== undefined &&
    req.body.community.createdBy !== '';

  const createCommunity = async (req: CreateCommunityRequest, res: Response): Promise<void> => {
    if (!isCommunityBodyValid(req)) {
      res.status(400).send('Invalid community body');
      return;
    }

    const requestCommunity = req.body.community;

    const community: Community = {
      ...requestCommunity,
      groupChatId: new ObjectId(),
    };

    const result: CommunityResponse = await saveCommunity(community);

    if ('error' in result) {
      res.status(500).send(result.error);
      return;
    }

    res.status(200).json(result);
  };

  const getCommunities = async (req: Request, res: Response): Promise<void> => {
    const communities: CommunitiesResponse = await getAllCommunities();

    if ('error' in communities) {
      res.status(500).send(communities.error);
      return;
    }

    res.status(200).json(communities);
  };
};
