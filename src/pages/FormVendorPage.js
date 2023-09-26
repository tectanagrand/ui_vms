import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  TextField,
  Typography,
  Box,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NumericFormat } from 'react-number-format';
import { useState, useRef, useEffect, useReducer } from 'react';
import { VenBankTable } from 'src/components/FormVendor';
import { BankV } from 'src/_mock/Bank';
import { File } from 'src/_mock/File';
import UploadButton from 'src/components/common/UploadButton';
import { useParams } from 'react-router-dom';

export default function FormVendorPage() {
  const params = useParams();
  const ttoken = params.token;
  const initialForm = {
    is_draft: false,
    ticket_id: '',
    ven_id: '',
    email_head: '',
    dept_head: '',
  };
  const [local_ovs, setLocalovs] = useState('');
  const [lim_curr, setLimitCurr] = useState('');
  const [lim_ven, setLimven] = useState('');
  const [country_ven, setCountryven] = useState('');
  const [city_ven, setCityven] = useState('');
  const [pay_mthd, setPayMthd] = useState('');
  const [pay_term, setPayTerm] = useState('');

  const comp_name = useRef();
  const title = useRef();
  const address = useRef();
  const postalcode = useRef();
  const telf = useRef();
  const fax = useRef();
  const tax_num = useRef();
  const email_ven = useRef();
  const is_pkp = useRef();

  const [ven_bank, setVen_bank] = useState([]);
  const [ven_file, setVen_file] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [expanded, setExpanded] = useState({
    panelReqDet: true,
    panelCompDet: true,
    panelAddr: true,
    panelTax: true,
    panelBank: true,
    panelFile: true,
  });
  const [headerForm, setHeaderForm] = useState(initialForm);

  const dynaCity = async () => {
    try {
      const cities = await fetch(`${process.env.REACT_APP_URL_LOC}/master/city`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ countryId: country_ven }),
      });
      const response = await cities.json();
      const result = response.data;
      setCities(result.data);
    } catch (err) {
      alert(err.stack);
    }
  };

  const dynaCountry = async () => {
    try {
      const country = await fetch(`${process.env.REACT_APP_URL_LOC}/master/country`, {
        method: 'POST',
      });
      const response = await country.json();
      const result = response.data;
      setCountries(result.data);
    } catch (err) {
      alert(err.stack);
    }
  };

  const getCurr = async () => {
    try {
      const curr = await fetch(`${process.env.REACT_APP_URL_LOC}/master/curr`, {
        method: 'GET',
      });
      const response = await curr.json();
      const result = response.data;
      let currobj = {};
      result.data.map((item) => {
        currobj[item.id_cur] = item.code;
      });
      setCurrencies(currobj);
    } catch (err) {
      alert(err.stack);
    }
  };

  const getHeader = async () => {
    try {
      const ticket = await fetch(`${process.env.REACT_APP_URL_LOC}/ticket/form/new/${ttoken}`, {
        method: 'GET',
      });
      const response = await ticket.json();
      const data = response.data;
      setHeaderForm({
        is_draft: false,
        ticket_id: data.ticket_id,
        ven_id: data.ven_id,
        email_head: data.email_proc,
        dept_head: data.dep_proc,
      });
    } catch (err) {
      alert(err.stack);
    }
  };

  useEffect(() => {
    const getTimeout = setTimeout(() => {
      dynaCountry();
      dynaCity();
    }, 500);
    return () => clearTimeout(getTimeout);
  }, [country_ven]);

  useEffect(() => {
    const getTimeout = setTimeout(() => {
      getCurr();
      getHeader();
    }, 500);
    return () => clearTimeout(getTimeout);
  }, []);

  const setVen_bankFromChild = (newItem) => {
    setVen_bank(newItem);
    console.log(ven_bank);
  };

  const setVen_fileFromChild = (newItem) => {
    setVen_file(newItem);
    // console.log(newItem);
    // console.log(ven_file);
  };

  const handleSubmit = (event) => {};

  const handleExpanded = (panel) => () => {
    if (panel === 'panelReqDet') {
      setExpanded({
        ...expanded,
        panelReqDet: expanded.panelReqDet ? false : true,
      });
    } else if (panel === 'panelCompDet') {
      setExpanded({
        ...expanded,
        panelCompDet: expanded.panelCompDet ? false : true,
      });
    } else if (panel === 'panelAddr') {
      setExpanded({
        ...expanded,
        panelAddr: expanded.panelAddr ? false : true,
      });
    } else if (panel === 'panelTax') {
      setExpanded({
        ...expanded,
        panelTax: expanded.panelTax ? false : true,
      });
    } else if (panel === 'panelBank') {
      setExpanded({
        ...expanded,
        panelBank: expanded.panelBank ? false : true,
      });
    } else if (panel === 'panelFile') {
      setExpanded({
        ...expanded,
        panelFile: expanded.panelFile ? false : true,
      });
    }
  };

  return (
    <>
      <Container>
        <Box sx={{ height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Form Vendor Registration
          </Typography>
        </Box>
        <Container>
          <Accordion expanded={expanded.panelReqDet} onChange={handleExpanded('panelReqDet')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
              id="panelReqDet"
            >
              <Typography>Requestor</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    id="emailRequestor"
                    label="Email"
                    variant="outlined"
                    value={headerForm.email_head}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs>
                  <TextField
                    fullWidth
                    id="deptRequestor"
                    label="Department"
                    variant="outlined"
                    value={headerForm.dept_head}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded.panelCompDet} onChange={handleExpanded('panelCompDet')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
              id="panelCompDet"
            >
              <Typography>Company Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField fullWidth id="titleComp" label="Title" variant="outlined" inputRef={title} />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel id="local-ovs-label">Local / Overseas</InputLabel>
                    <Select
                      id="localOverseas"
                      labelId="local-ovs-label"
                      label="Local / Overseas"
                      variant="outlined"
                      value={local_ovs}
                      onChange={(e) => {
                        setLocalovs(e.target.value);
                      }}
                    >
                      <MenuItem value={'LOCAL'}>Local</MenuItem>
                      <MenuItem value={'OVERSEAS'}>Overseas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth id="nameComp" label="Company Name" variant="outlined" inputRef={comp_name} />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel id="limCurrLabel">Limit Currency</InputLabel>
                    <Select
                      id="limCurr"
                      labelId="limCurrLabel"
                      value={lim_curr}
                      label="Limit Currency"
                      variant="outlined"
                      onChange={(e) => {
                        setLimitCurr(e.target.value);
                      }}
                    >
                      {Object.keys(currencies).map((id) => {
                        return (
                          <MenuItem id={id} value={id} key={id}>
                            {currencies[id]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <NumericFormat
                    value={lim_ven}
                    prefix={currencies[lim_curr] + ' '}
                    thousandSeparator
                    customInput={TextField}
                    label={'Limit Vendor'}
                    fullWidth
                    onChange={(e) => {
                      setTimeout(() => {
                        setLimven(e.target.value.replace(`-?\\d+(\\.\\d+)?`, ''));
                      }, 1000);
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded.panelAddr} onChange={handleExpanded('panelAddr')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
              id="panelAddr"
            >
              <Typography>Address</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel id="countrySelectLabel" htmlFor="countrySelect">
                      Country
                    </InputLabel>
                    <Select
                      id="countrySelect"
                      labelId="countrySelectLabel"
                      label="Country"
                      variant="outlined"
                      value={country_ven}
                      onChange={(e) => {
                        setTimeout(() => {
                          setCountryven(e.target.value);
                        }, 300);
                      }}
                    >
                      {countries.map((item, idx) => (
                        <MenuItem key={`${item.country_id}_${idx}`} value={item.country_code}>
                          {item.country_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={9}>
                  <TextField fullWidth id="addressField" label="Address" inputRef={address} />
                </Grid>
                <Grid item xs={3}>
                  <TextField id="postalCode" label="Postal Code" inputRef={postalcode} />
                </Grid>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="City">City</InputLabel>
                    <Select
                      id="cityField"
                      label="City"
                      labelId="City"
                      variant="outlined"
                      value={city_ven}
                      onChange={(e) => {
                        setCityven(e.target.value);
                      }}
                    >
                      {cities.map((item) => (
                        <MenuItem id={item.code} key={item.code} value={item.city}>
                          {item.city}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {/* <TextField fullWidth id="cityField" label="City" /> */}
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={3}>
                  <TextField fullWidth id="telf1Field" label="Telephone" inputRef={telf} />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth id="faxField" label="Fax" inputRef={fax} />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth id="email" label="Email" inputRef={email_ven} />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded.panelTax} onChange={handleExpanded('panelTax')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
            >
              <Typography>Tax and Payment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox id="is_PKP" inputRef={is_pkp} />}
                      label="Pengusaha Kena Pajak (PKP)"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={9}></Grid>
                <Grid item xs={6}>
                  <TextField fullWidth id="taxNumberField" label="Tax Number (NPWP)" inputRef={tax_num} />
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="paymentMethodField">Payment Method</InputLabel>
                    <Select
                      id="paymentMethodLabel"
                      labelId="paymentMethodLabel"
                      variant="outlined"
                      value={pay_mthd}
                      onChange={(e) => {
                        setPayMthd(e.target.value);
                      }}
                    >
                      <MenuItem>Bank</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="paymentTermField">Payment Term</InputLabel>
                    <Select
                      id="paymentTermField"
                      labelId="paymentTermField"
                      variant="outlined"
                      value={pay_term}
                      onChange={(e) => {
                        setPayTerm(e.target.value);
                      }}
                    >
                      <MenuItem>30</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded.panelBank} onChange={handleExpanded('panelBank')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
            >
              <Typography>Bank Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <VenBankTable onChildDataChange={setVen_bankFromChild} initData={{}} />
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded.panelFile} onChange={handleExpanded('panelFile')}>
            <AccordionSummary
              sx={{
                pointerEvents: 'none',
              }}
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    pointerEvents: 'auto',
                  }}
                />
              }
            >
              <Typography>File Upload</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <UploadButton
                inputTypes={[
                  { key: 'SPPKP', value: 'SPPKP' },
                  { key: 'KTP', value: 'KTP' },
                ]}
                iniData={{}}
                onChildDataChange={setVen_fileFromChild}
              />
            </AccordionDetails>
          </Accordion>
        </Container>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
          <Button sx={{ height: 50, width: 100, margin: 2 }} onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Container>
    </>
  );
}
