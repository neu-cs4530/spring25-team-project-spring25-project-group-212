import './index.css';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import useAnswerForm from '../../../hooks/useAnswerForm';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const { text, textErr, setText, postAnswer } = useAnswerForm();
  const [useMarkdown, setUseMarkdown] = useState(false);

  return (
    <Form>
      <TextArea
        title={'Answer Text'}
        id={'answerTextInput'}
        val={text}
        setState={setText}
        err={textErr}
      />
      <div className='toggle-container'>
        <label>
          <input
            type='checkbox'
            checked={useMarkdown}
            onChange={() => setUseMarkdown(!useMarkdown)}
          />
          Enable Markdown
        </label>
      </div>
      {useMarkdown && text && (
        <div className='markdown-preview' style={{ marginBottom: '20px' }}>
          <h3>Markdown Preview:</h3>
          <div className='markdown-box'>
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      )}
      <div className='btn_indicator_container'>
        <button className='form_postBtn' onClick={postAnswer}>
          Post Answer
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewAnswerPage;
