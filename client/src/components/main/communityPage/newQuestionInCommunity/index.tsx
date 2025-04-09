import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@chakra-ui/react';
import rehypeHighlight from 'rehype-highlight';
import useNewQuestionCommunity from '../../../../hooks/useNewQuestionCommunity';
import Form from '../../baseComponents/form';
import Input from '../../baseComponents/input';
import TextArea from '../../baseComponents/textarea';
import Checkbox from '../../baseComponents/checkbox';
import './index.css';

/**
 * NewQuestionInCommunityPage component allows users to submit a new question with a title,
 * description, tags, and username to a community.
 */
const NewQuestionInCommunityPage = () => {
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    anonymous,
    setAnonymous,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
    useMarkdown,
    setUseMarkdown,
  } = useNewQuestionCommunity();

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
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{text}</ReactMarkdown>
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
      <Checkbox
        title={'Anonymous'}
        hint={'Check if the question should be displayed anonymous'}
        id={'formAnonymousInpus'}
        val={anonymous}
        setState={setAnonymous}
      />
      <div className='btn_indicator_container'>
        <Button
          colorPalette='blue'
          size='xl'
          onClick={() => {
            postQuestion();
          }}>
          Post Question To Community
        </Button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewQuestionInCommunityPage;
