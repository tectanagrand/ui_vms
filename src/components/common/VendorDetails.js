import { Container, Grid, Typography, Divider, TextField, Skeleton, Box } from '@mui/material';
import { useRef } from 'react';
// import useFetcherSWR from 'src/hooks/useFetcher';
import useAxiosPrivate from 'src/hooks/useAxiosPrivate';
import useSWR from 'swr';

export default function VendorDetail(props) {
  const idVendor = props.data.id;
  const axiosPrivate = useAxiosPrivate();
  const fetcher = (url) => axiosPrivate.get(url).then((res) => res.data);
  // const { Fetcher } = useFetcherSWR();
  const { data, error, isLoading } = useSWR(`/vendor/infoven/?id=${idVendor}`, fetcher);
  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" height={500} />;
  } else {
    return (
      <Container>
        <Grid container spacing={1}>
          <Grid item xs={2}>
            <Typography>Title</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.title}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Company</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.company}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Local/Overseas</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.local_ovs}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Address</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.street}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Country</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.country_name}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>City</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.city}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Telephone</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.telf1}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Email</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.email}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Purchasing Org.</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.purch_org}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Vendor Group</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.ven_group}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Vendor Acc.</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.ven_acc}</Typography>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={2}>
            <Typography>Vendor Type</Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography>{data?.data.ven_type}</Typography>
          </Grid>
        </Grid>
        {data?.data.lim_curr !== '' && (
          <Grid container>
            <Grid item xs={2}>
              <Typography>Limit Vendor</Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography>:</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography>
                {data?.data.lim_curr} {data?.data.limit_vendor}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Container>
    );
  }
}
