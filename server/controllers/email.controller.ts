import nodemailer from 'nodemailer';
import { getQuestionsByOrder } from '../services/question.service';
import { getUsersList } from '../services/user.service';
import { PopulatedDatabaseQuestion } from '../types/types';

/**
 * Creates and configures the email controller.
 * Provides methods for sending emails, retrieving email addresses, generating email content, and handling daily digest emails.
 */
const emailController = () => {
  /**
   * Sends an email to the specified recipients.
   *
   * @param {string[]} receivers - The list of email addresses to send the email to.
   * @param {string} subject - The subject of the email.
   * @param {string} contents - The HTML content of the email.
   * @returns {Promise<void>} - A promise that resolves when the email is sent.
   */
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
      from: '"Community Overflow Team" <fakestackoverflow.digest@gmail.com>',
      to: receivers,
      subject,
      html: contents,
    });
  };

  /**
   * Retrieves the list of email addresses of all users.
   *
   * @returns {Promise<string[]>} - A promise that resolves to an array of email addresses.
   * If an error occurs, an empty array is returned.
   */
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

  /**
   * Finds the top questions based on the specified category (most voted or most viewed).
   *
   * @param {PopulatedDatabaseQuestion[]} questions - The list of questions to evaluate.
   * @param {'voted' | 'viewed'} category - The category to evaluate ('voted' for top voted, 'viewed' for most viewed).
   * @returns {PopulatedDatabaseQuestion[]} - An array of the top questions in the specified category.
   */
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

  /**
   * Generates the HTML content for the daily digest email.
   *
   * @returns {Promise<string>} - A promise that resolves to the HTML content of the email.
   * If an error occurs, a generic error message is returned.
   */
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
                    <h1> No questions were asked yesterday :( </h1>
                `;
    } catch (error) {
      return 'An error occurred. Please contact the Community Overflow Team';
    }
  };

  /**
   * Handles sending the daily digest email to all users.
   *
   * @returns {Promise<void>} - A promise that resolves when the email is sent.
   */
  const handleSendDigestEmail = async () => {
    await send(
      await getEmails(),
      `${new Date().toISOString().split('T')[0]} - Daily Digest`,
      await getContents(),
    );
  };

  return { send, getEmails, getContents, topQuestionFinder, handleSendDigestEmail };
};

export default emailController;
