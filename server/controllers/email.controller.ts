import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import nodemailer from 'nodemailer';
import { getQuestionsByOrder } from '../services/question.service';
import { getUsersList } from '../services/user.service';

const emailController = () => {
  const send = async (receivers: string[], subject: string, contents: string) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'fakestackoverflow.digest@gmail.com',
        pass: process.env.GMAIL,
      },
    });

    await transporter.sendMail({
      from: '"FakeStackoverflow Team" <fakestackoverflow.digest@gmail.com>',
      to: receivers,
      subject,
      html: contents,
    });
  };

  const getEmails = async () => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      const unfilteredEmails = users.map(user => (user.email ? user.email : ''));
      const emails = unfilteredEmails.filter(email => email !== '');
      return emails;
    } catch (error) {
      return [];
    }
  };

  const topQuestionFinder = (
    questions: PopulatedDatabaseQuestion[],
    category: 'voted' | 'viewed',
  ) => {
    let bestValue = -Infinity;
    let topQuestions: PopulatedDatabaseQuestion[] = [];

    questions.forEach(question => {
      let currentValue = 0;
      if (category === 'voted') {
        currentValue = question.upVotes.length - question.downVotes.length;
      } else {
        currentValue = question.views.length;
      }

      if (currentValue > bestValue) {
        bestValue = currentValue;
        topQuestions = [question];
      } else if (currentValue === bestValue) {
        topQuestions.push(question);
      }
    });
    return topQuestions;
  };

  const getContents = async () => {
    try {
      const allQuestions = await getQuestionsByOrder('newest');

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdaysQuestions = allQuestions.filter(q => {
        const qDate = new Date(q.askDateTime);
        qDate.setHours(0, 0, 0, 0);
        return qDate.getTime() === yesterday.getTime();
      });

      const mostViewed = topQuestionFinder(yesterdaysQuestions, 'viewed');
      const topVoted = topQuestionFinder(yesterdaysQuestions, 'voted');
      if (yesterdaysQuestions.length > 0) {
        return `
                    <h1>Yesterday's Top Questions</h1>
                    <div>
                        <h2>Most Viewed Questions</h2>
                        ${mostViewed
                          .map(
                            question => `
                            <p>
                                <a href="${process.env.CLIENT_URL}/question/${question._id}">${question.title}</a>:
                                <div>${question.text}</div>
                            </p>
                        `,
                          )
                          .join('')}
                    </div>
                    <div>
                        <h2>Top Voted Questions</h2>
                        ${topVoted
                          .map(
                            question => `
                            <p>
                                <a href="${process.env.CLIENT_URL}/question/${question._id}">${question.title}</a>:
                                <div>${question.text}</div>
                            </p>
                        `,
                          )
                          .join('')}
                    </div>
                `;
      }
      return `
                    <h1> No questions were asked yesteday :( </h1>
                `;
    } catch (error) {
      return 'An error occurred. Please contact the FakeStackoverflow Team';
    }
  };

  const handleSendDigestEmail = async () => {
    await send(
      await getEmails(),
      `${new Date().toISOString().split('T')[0]} - Daily Digest`,
      await getContents(),
    );
  };

  return { handleSendDigestEmail };
};

export default emailController;
