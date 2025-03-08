import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useNewQuestion from '../../../hooks/useNewQuestion';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import './index.css';

/**
 * NewQuestionPage component allows users to submit a new question with a title,
 * description, tags, and username.
 */
const NewQuestionPage = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
  } = useNewQuestion();

  const [useMarkdown, setUseMarkdown] = useState(false);

  return (
    <Form>
      <Input
        title={'Question Title'}
        hint={'Limit title to 100 characters or less'}
        id={'formTitleInput'}
        val={title}
        setState={setTitle}
        err={titleErr}
      />
      <TextArea
        title={'Question Text'}
        hint={'Add details'}
        id={'formTextInput'}
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

      <Input
        title={'Tags'}
        hint={'Add keywords separated by whitespace'}
        id={'formTagInput'}
        val={tagNames}
        setState={setTagNames}
        err={tagErr}
      />
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            postQuestion();
          }}>
          Post Question
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewQuestionPage;
