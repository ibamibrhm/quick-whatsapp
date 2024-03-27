import { useState, ChangeEvent } from 'react';
import { Button, Paper, Container, Typography, Autocomplete, TextField, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import countries from './db/countries.json';
import getCountryCode from './utils/getCountryCode';

interface ICountry {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
}

const validateInitialState = {
  error: false,
  errorText: '',
};

const KEY_LOCAL_STORAGE = 'selected-country';

function getInitialCountry() {
  const memorySelectedCountry = window.localStorage.getItem(KEY_LOCAL_STORAGE);

  if (memorySelectedCountry) {
    return JSON.parse(memorySelectedCountry);
  }

  const defaultCountry = countries[101];

  const cCode = getCountryCode();

  if (!cCode) {
    return defaultCountry;
  }

  const matchCountry = countries.find(country => country.code === cCode);

  return matchCountry || defaultCountry;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<ICountry>(getInitialCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validate, setValidate] = useState(validateInitialState);

  const handleStartChat = () => {
    if (!phoneNumber.length) {
      setValidate({ error: true, errorText: 'Phone Number is Required' });
      return;
    }

    window.location.assign(`https://wa.me/${selectedCountry.dial_code.slice(1)}${phoneNumber}`)
  };

  const handleChangePhoneNumber = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValidate(validateInitialState);
    let phoneInput = e.target.value.replace(/\D/g, '');

    const countryDialCode = selectedCountry.dial_code.slice(1);

    if (phoneInput.startsWith(countryDialCode)) {
      phoneInput = phoneInput.slice(countryDialCode.length);
    }

    phoneInput = phoneInput.replace(/^0+/, '');
    setPhoneNumber(phoneInput);
  };

  const handleSelectCountry = (country: ICountry) => {
    setSelectedCountry(country);
    window.localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(country));
  };

  return (
    <Container>
      <Paper sx={{ mt: 10, mb: 1, p: 5 }} elevation={24}>
        <Grid container justifyContent="center" spacing={2}>
          <Grid xs={12}>
            <Typography align="center" mb={3}>
              Tired of saving numbers just to shoot a quick message on WhatsApp? <br />
              We feel you! Say goodbye to that hassle.
            </Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Autocomplete
              disablePortal
              value={selectedCountry}
              onChange={(_, newValue) => {
                handleSelectCountry(newValue);
              }}
              disableClearable
              id="country-select"
              options={countries}
              getOptionLabel={(option) => `${option.flag} ${option.name}`}
              isOptionEqualToValue={(opt, val) => opt.code === val.code}
              renderInput={(params) => <TextField {...params} label="Search & Select Country" />}
            />
          </Grid>
          <Grid>
            <TextField
              required
              autoFocus
              inputProps={{ inputMode: 'numeric' }}
              label="Phone Number"
              id="phone-number-input"
              error={validate.error}
              value={phoneNumber}
              onChange={handleChangePhoneNumber}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleStartChat();
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">{selectedCountry.dial_code}</InputAdornment>,
              }}
              helperText={validate.errorText}
            />
          </Grid>
          <Grid>
            <Button variant="contained" color="success" onClick={handleStartChat} size="large" startIcon={<img src="/quick-whatsapp-logo.png" width={30} height={30} alt="quick-whatsapp logo" />}>
              Start Chat
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Button
        variant="outlined"
        href="https://github.com/ibamibrhm/quick-whatsapp"
        target="_blank"
        size="small"
        color="info"
      >
        Source Code
      </Button>
    </Container>
  );
}

export default App;
