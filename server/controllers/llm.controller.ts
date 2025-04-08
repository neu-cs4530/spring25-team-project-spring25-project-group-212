import { Chat } from '@fake-stack-overflow/shared/types/chat';
import { getAllCommunities, saveQuestionToCommunity } from '../services/community.service';
import { DatabaseCommunity, Community, Question } from '../types/types';
import QuestionModel from '../models/questions.model';
import assignCommunityFromLLM from '../services/llm.service';

const llmController = () => {
  const runLLMCommunityTagging = async (): Promise<void> => {
    // console.log('Starting LLM community tagging...');

    const communitiesResponse = await getAllCommunities();
    if ('error' in communitiesResponse) {
      // console.error('Error retrieving communities:', communitiesResponse.error);
      throw new Error('Failed to retrieve communities');
    }

    const dbCommunities = communitiesResponse as DatabaseCommunity[];
    // console.log(`Fetched ${dbCommunities.length} communities from database.`);

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
    // console.log(
    //   `Collected ${allQuestionIdsInCommunities.size} question IDs already assigned to communities.`,
    // );

    const unassignedQuestions = await QuestionModel.find({
      _id: { $nin: Array.from(allQuestionIdsInCommunities) },
    });
    // console.log(`Found ${unassignedQuestions.length} unassigned questions.`);

    const assignPromises = unassignedQuestions.map(async question => {
      // console.log(`Assigning question "${question.title}" (${question._id})...`);

      const suggestedCommunityName = await assignCommunityFromLLM(
        question as unknown as Question,
        communities,
      );

      // console.log(`Suggested community for "${question.title}":`, suggestedCommunityName);

      const matchedCommunity = dbCommunities.find(c => c.name === suggestedCommunityName);
      if (matchedCommunity) {
        // console.log(`Saving question "${question.title}" to community "${matchedCommunity.name}".`);
        await saveQuestionToCommunity(matchedCommunity._id.toString(), question._id.toString());
      } else {
        // console.warn(`No matching community found for: ${suggestedCommunityName}`);
      }
    });

    await Promise.all(assignPromises);

    // console.log('LLM community tagging complete.');
  };

  return { runLLMCommunityTagging };
};

export default llmController;
