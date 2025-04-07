import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import {
  getCommunities,
  getCommunityById,
  updateCommunityNameAboutRules,
} from '../services/communityService';
import useUserContext from './useUserContext';

const useCommunityNameAboutRules = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>();
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [newRules, setNewRules] = useState('');
  const [err, setErr] = useState('');
  const [canEditNameAboutRules, setCanEditNameAboutRules] = useState(false);
  const [rankingByMembers, setRankingByMembers] = useState<number | null>(null);
  const [rankingByQuestionsAnswers, setRankingByQuestionsAnswers] = useState<number | null>(null);
  const [communityMemberCount, setCommunityMemberCount] = useState<number | null>(null);
  const [communityContentCount, setCommunityContentCount] = useState<number | null>(null);

  useEffect(() => {
    const communityExistsCheck = async () => {
      if (!id) {
        setErr('Error retrieving community');
        return undefined;
      }
      try {
        await getCommunityById(id);
        setErr('');
      } catch (error) {
        setErr('Error retrieving community');
      }
      return undefined;
    };

    communityExistsCheck();
    if (!id) {
      setErr('Error retrieving community');
      return;
    }

    const fetchCommunityAndSetCanEdit = async () => {
      try {
        const communityFromId = await getCommunityById(id);
        if (communityFromId) {
          setCommunity(communityFromId);
          if (communityFromId.admins.includes(user.username)) {
            setCanEditNameAboutRules(true);
          }
        } else {
          setErr('Community not found');
        }
      } catch (error) {
        setErr('Community not found');
      }
    };

    fetchCommunityAndSetCanEdit();
  }, [id, user.username]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const communities = await getCommunities();
        if (community) {
          const sortedByMembers = communities
            .slice()
            .sort((a, b) => b.members.length - a.members.length);

          const memberRanks: { [id: string]: number } = {};
          let currentRank = 1;

          sortedByMembers.forEach((c, index) => {
            if (index > 0 && sortedByMembers[index - 1].members.length !== c.members.length) {
              currentRank = index + 1;
            }
            memberRanks[c._id.toString()] = currentRank;
          });

          setRankingByMembers(memberRanks[community._id.toString()]);

          const sortedByQuestionsAnswers = communities
            .slice()
            .sort((a, b) => {
              const totalAnswersA = a.questions.reduce(
                (sum, question) => sum + question.answers.length,
                0,
              );
              const totalAnswersB = b.questions.reduce(
                (sum, question) => sum + question.answers.length,
                0,
              );
              const totalA = a.questions.length + totalAnswersA;
              const totalB = b.questions.length + totalAnswersB;
              return totalB - totalA;
            });

          const qaRanks: { [id: string]: number } = {};
          currentRank = 1;

          sortedByQuestionsAnswers.forEach((c, index) => {
            const totalAnswersC = c.questions.reduce(
              (sum, question) => sum + question.answers.length,
              0,
            );
            const totalC = c.questions.length + totalAnswersC;

            const totalAnswersPrev = sortedByQuestionsAnswers[index - 1]?.questions.reduce(
              (sum, question) => sum + question.answers.length,
              0,
            );
            const totalPrev =
              (sortedByQuestionsAnswers[index - 1]?.questions.length || 0) +
              (totalAnswersPrev || 0);
            if (index > 0 && totalPrev !== totalC) {
              currentRank = index + 1;
            }
            qaRanks[c._id.toString()] = currentRank;
          });

          setRankingByQuestionsAnswers(qaRanks[community._id.toString()]);

          setCommunityMemberCount(community.members.length);
          const totalAnswers = community.questions.reduce(
            (sum, question) => sum + question.answers.length,
            0,
          );
          const totalContent = community.questions.length + totalAnswers;
          setCommunityContentCount(totalContent);
        }
      } catch (error) {
        setErr('Error calculating community rankings');
      }
    };

    fetchRankings();
  }, [community]);

  const handleEditNameAboutRules = async () => {
    if (!community) {
      return;
    }

    if (!community.admins.includes(user.username)) {
      return;
    }

    try {
      const updatedCommunity = await updateCommunityNameAboutRules(
        community._id.toString(),
        newName,
        newAbout,
        newRules,
      );
      await new Promise(resolve => {
        setCommunity(updatedCommunity);
        setEditMode(false);
        resolve(null);
      });
      setErr('');
    } catch (error) {
      setErr('Could not edit name, about, and/or rules');
    }
  };

  return {
    community,
    editMode,
    setEditMode,
    newName,
    setNewName,
    newAbout,
    setNewAbout,
    newRules,
    setNewRules,
    communityExistsError: err,
    handleEditNameAboutRules,
    canEditNameAboutRules,
    rankingByMembers,
    rankingByQuestionsAnswers,
    communityMemberCount,
    communityContentCount,
  };
};

export default useCommunityNameAboutRules;
