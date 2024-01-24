import {
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  Box,
  Button,
  Typography,
  Skeleton,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSession } from 'src/provider/sessionProvider';
import TableLayout from 'src/components/common/TableLayoutv1';
import { Check, DoDisturb } from '@mui/icons-material';
import useAxiosPrivate from 'src/hooks/useAxiosPrivate';
import { LoadingButton } from '@mui/lab';
import RefreshButton from 'src/components/common/RefreshButton';
import ReqStatDetail from 'src/components/common/ReqStatDetail';

export default function ListReqStat() {
  const axiosPrivate = useAxiosPrivate();
  const [btnClicked, setBtnclicked] = useState();
  const columns = [
    { data: 'Ticket Number', header: 'Ticket Number' },
    {
      data: 'Date',
      header: 'Date',
    },
    {
      data: 'Requestor',
      header: 'Requestor',
    },
    {
      data: 'RequestDesc',
      header: 'Request Description',
    },
    {
      data: 'Vendor Code',
      header: 'Vendor Code',
    },
    {
      data: 'Vendor Name',
      header: 'Vendor Name',
    },
    {
      header: 'Action',
      renderCell: (item) => {
        if (item.is_active) {
          return (
            <>
              <Tooltip key={`${item.id}.reqdescacc`} title={<Typography>Accept</Typography>}>
                <IconButton sx={{ backgroundColor: '#4ef542', mx: 1 }} onClick={() => handleAppr('accept', item)}>
                  <Check></Check>
                </IconButton>
              </Tooltip>
              <Tooltip key={`${item.id}.reqdescrej`} title={<Typography>Reject</Typography>}>
                <IconButton sx={{ backgroundColor: '#f2573f', mx: 1 }} onClick={() => handleAppr('reject', item)}>
                  <DoDisturb></DoDisturb>
                </IconButton>
              </Tooltip>
            </>
          );
        }
      },
    },
  ];
  const { session } = useSession();
  const [btnState, setBtn] = useState(['accept', 'reject']);
  const [refreshBtn, setRefresh] = useState(true);
  const [reload, setReload] = useState(true);
  const [openValid, setOpenval] = useState(false);
  const [apprType, setAppr] = useState('');
  const [venData, setVendata] = useState({});
  const [ticket, setTicket] = useState();
  const [colLength, setColLength] = useState(0);
  const [filterAct, setFilteract] = useState(true);
  const [formStat, setFormstat] = useState({
    stat: false,
    type: 'success',
    message: '',
  });

  const handleSnackClose = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setFormstat({ ...formStat, stat: false });
  };

  const handleAppr = (type, data) => {
    setOpenval(true);
    setAppr(type);
    setVendata(ticket.find((item) => item.id === data.id));
  };

  const buttonRefreshAct = () => {
    setRefresh(true);
  };

  const handleProcessReq = async (action, id) => {
    setBtnclicked(true);
    try {
      const jsonSend = {
        ticketid: id,
        session: session.user_id,
        action: action,
      };
      const processReq = await axiosPrivate.post(`/reqstat/process`, jsonSend);
      setFormstat({
        stat: true,
        type: 'success',
        message: processReq.data.message,
      });
      setOpenval(false);
      setReload(!reload);
      setBtnclicked(false);
      setRefresh(true);
    } catch (error) {
      setRefresh(true);
      setBtnclicked(false);
      setFormstat({
        stat: true,
        type: 'error',
        message: error,
      });
    }
  };

  useEffect(() => {
    const getTicket = async () => {
      try {
        const fetchTicket = await axiosPrivate.get(`/reqstat/show?is_active=${filterAct}`);
        setTicket(fetchTicket.data.data);
        setRefresh(false);
      } catch (error) {
        console.log(error);
        alert(error);
        setRefresh(false);
      }
    };
    if (filterAct === false) {
      setBtn([]);
    } else {
      setBtn(['accept', 'reject']);
    }
    if (refreshBtn) {
      getTicket();
    }
  }, [reload, filterAct, refreshBtn]);

  useEffect(() => {
    setColLength(columns.length + 1);
  }, [ticket]);

  return (
    <>
      <FormControl>
        <Select
          sx={{ width: '10em' }}
          id={'filterAct'}
          value={filterAct}
          onChange={() => {
            setFilteract(!filterAct);
            setRefresh(true);
          }}
        >
          <MenuItem value={true}>Active</MenuItem>
          <MenuItem value={false}>Not Active</MenuItem>
        </Select>
      </FormControl>
      <RefreshButton
        setRefreshbtn={buttonRefreshAct}
        isLoading={refreshBtn}
        sx={{ width: '3.5rem', height: '3.5rem', ml: 2 }}
      />

      {ticket != undefined ? (
        <TableLayout data={ticket} lengthRow={colLength} header={columns} detailsComp={ReqStatDetail} />
      ) : (
        <Box>
          <Skeleton animation="wave" height={100} />
          <Skeleton animation="wave" height={100} />
          <Skeleton animation="wave" height={100} />
          <Skeleton animation="wave" height={100} />
          <Skeleton animation="wave" height={100} />
        </Box>
      )}

      <Snackbar
        open={formStat.stat}
        onClose={handleSnackClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={formStat.type} onClose={handleSnackClose} variant="filled">
          {formStat.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={openValid}
        onClose={() => {
          setOpenval(false);
        }}
      >
        <Box
          sx={{
            width: 400,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4">Are you sure want to {apprType} ?</Typography>
          {venData['RequestDesc'] == 'Reactivation' && <Typography variant="h5">Reactivation Request</Typography>}
          {venData['RequestDesc'] == 'Deactivation' && <Typography variant="h5">Deactivation Request</Typography>}
          <Typography variant="h6">
            {venData['Vendor Name']} - {venData['Vendor Code']}{' '}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <LoadingButton
              sx={{ width: 50 }}
              variant="contained"
              onClick={(e) => handleProcessReq(apprType, venData['id'])}
              loading={btnClicked}
            >
              <Typography>Yes</Typography>
            </LoadingButton>
            <Button
              sx={{ width: 50 }}
              variant="contained"
              onClick={() => {
                setOpenval(false);
              }}
            >
              <Typography>No</Typography>
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
