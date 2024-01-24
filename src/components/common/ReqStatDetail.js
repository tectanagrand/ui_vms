import { Typography, TextField } from '@mui/material';

export default function ReqStatDetail({ data }) {
  return (
    <>
      <Typography variant="h6" sx={{ mx: 2, my: 2 }}>
        Details
      </Typography>
      <TextField
        key={data.id + 'detailText'}
        inputProps={{ readOnly: true }}
        multiline
        value={data.details}
        fullWidth
        sx={{ px: 4 }}
      />
    </>
  );
}
