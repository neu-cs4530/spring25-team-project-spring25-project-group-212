import { Button } from '@chakra-ui/react';
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
        <Button
          colorPalette='blue'
          size='xl'
          onClick={() => {
            postCommunity();
          }}>
          Create Community
        </Button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
      </div>
    </Form>
  );
};

export default NewCommunityPage;
