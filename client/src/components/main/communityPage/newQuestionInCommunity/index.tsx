import React from 'react';
import useNewQuestionCommunity from '../../../../hooks/useNewQuestionCommunity';
import Form from '../../baseComponents/form';
import Input from '../../baseComponents/input';
import TextArea from '../../baseComponents/textarea';

/**
 * NewQuestionPage component allows users to submit a new question with a title,
 * description, tags, and username.
 */
const NewQuestionInCommunityPage = () => {
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
          Post Question To Community
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewQuestionInCommunityPage;
