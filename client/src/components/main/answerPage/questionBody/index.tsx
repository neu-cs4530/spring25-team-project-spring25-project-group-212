import React from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { handleHyperlink } from '../../../../tool';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 * - isMarkdown - Boolean indicating if the text should be rendered as markdown.
 * - anonymous - If the question should be rendered anonymous.
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
  isMarkdown?: boolean;
  anonymous: boolean;
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink or markdown handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 * @param isMarkdown Whether to render the text as markdown.
 * @param anonymous If the question should be rendered anonymous.
 */
const QuestionBody = ({ views, text, askby, meta, isMarkdown = false, anonymous }: QuestionBodyProps) => (
  <div id='questionBody' className='questionBody right_padding'>
    <div className='bold_title answer_question_view'>{views} views</div>
    <div className='answer_question_text'>
      {isMarkdown ? <ReactMarkdown>{text}</ReactMarkdown> : handleHyperlink(text)}
    </div>
    <div className='answer_question_right'>
      <div className='question_author'>{anonymous ? <i>Anonymous</i> : askby}</div>
      <div className='answer_question_meta'>asked {meta}</div>
    </div>
  </div>
);

export default QuestionBody;
