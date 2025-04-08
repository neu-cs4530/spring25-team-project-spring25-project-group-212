import { Chat } from '@fake-stack-overflow/shared/types/chat';
import { getAllCommunities, saveQuestionToCommunity } from '../services/community.service';
import { DatabaseCommunity, Community, Question } from '../types/types';
import QuestionModel from '../models/questions.model';
import assignCommunityFromLLM from '../services/llm.service';

const llmController = () => {
  const runLLMCommunityTagging = async (): Promise<void> => {
    const communitiesResponse = await getAllCommunities();
    if ('error' in communitiesResponse) {
      throw new Error('Failed to retrieve communities');
    }

    const dbCommunities = communitiesResponse as DatabaseCommunity[];

    const communities: Community[] = dbCommunities.map(comm => ({
      name: comm.name,
      about: comm.about,
      rules: comm.rules,
      members: comm.members,
      admins: comm.admins,
      createdBy: comm.createdBy,
      groupChat: {} as Chat,
      questions: [],
      pendingInvites: [],
      memberHistory: comm.memberHistory,
    }));

    const allQuestionIdsInCommunities = new Set<string>();
    dbCommunities.forEach(comm => {
      comm.questions.forEach(qid => allQuestionIdsInCommunities.add(qid.toString()));
    });

    const unassignedQuestions = await QuestionModel.find({
      _id: { $nin: Array.from(allQuestionIdsInCommunities) },
    });

    const assignPromises = unassignedQuestions.map(async question => {
      const suggestedCommunityName = await assignCommunityFromLLM(
        question as unknown as Question,
        communities,
      );

      const matchedCommunity = dbCommunities.find(c => c.name === suggestedCommunityName);
      if (matchedCommunity) {
        await saveQuestionToCommunity(matchedCommunity._id.toString(), question._id.toString());
      }
    });

    await Promise.all(assignPromises);
  };

  return { runLLMCommunityTagging };
};

export default llmController;
