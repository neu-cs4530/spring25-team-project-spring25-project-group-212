import useNewCommunity from '../../../hooks/useNewCommunity';

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

  const isNameErr = nameErr !== '';
  const isAboutErr = aboutErr !== '';
  const isRulesErr = rulesErr !== '';
  return (
    <form>
      <input
        id='formNameInput'
        value={name}
        onChange={e => setName(e.target.value)}
        onError={isNameErr}
        helperText={nameErr}
        label='Enter Community Name'
      />
      <TextField
        id='formDescriptionInput'
        value={about}
        onChange={e => setAbout(e.target.value)}
        error={isAboutErr}
        helperText={aboutErr}
        label="Enter Community 'About' Text"
      />
      <TextField
        id='formRulesInput'
        value={rules}
        onChange={e => setRules(e.target.value)}
        error={isRulesErr}
        helperText={rulesErr}
        label='Enter Community Rules'
      />
      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          postCommunity();
        }}>
        Create Community
      </Button>
    </form>
  );
};

export default NewCommunityPage;
