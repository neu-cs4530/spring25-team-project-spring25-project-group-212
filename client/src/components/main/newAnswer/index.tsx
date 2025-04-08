import './index.css';
import ReactMarkdown from 'react-markdown';
import { Button } from '@chakra-ui/react';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import useAnswerForm from '../../../hooks/useAnswerForm';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const { text, textErr, setText, postAnswer, useMarkdown, setUseMarkdown } = useAnswerForm();

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
        <Button colorPalette='blue' size='xl' onClick={postAnswer}>
          Post Answer
        </Button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewAnswerPage;
