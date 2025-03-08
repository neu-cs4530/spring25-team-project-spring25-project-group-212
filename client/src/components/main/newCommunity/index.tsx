import useNewCommunity from '../../../hooks/useNewCommunity';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';

const NewCommunityPage = () => {
  const {
    name,
    setName,
    about,
    setAbout,
    rules,
    setRules,
    nameErr,
    aboutErr,
    rulesErr,
    postCommunity,
    err,
  } = useNewCommunity();

  return (
    <Form>
      <Input
        id={'formNameInput'}
        title={'Community Name'}
        hint={'Limit name to 100 characters or less'}
        val={name}
        setState={setName}
        err={nameErr}
      />
      <TextArea
        id='formAboutInput'
        title={'About Community'}
        hint={'Limit description to 500 characters or less'}
        val={about}
        setState={setAbout}
        err={aboutErr}
      />
      <TextArea
        id='formRulesInput'
        title={'Community Rules'}
        hint={'Limit rules to 500 characters or less'}
        val={rules}
        setState={setRules}
        err={rulesErr}
      />
      <div className='btn_indicator_container'>
        <button
          className='form_postBtn'
          onClick={() => {
            postCommunity();
          }}>
          Create Community
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewCommunityPage;
