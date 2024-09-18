import TableLayout from 'src/components/common/TableLayout';
import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import axios from 'axios';
import useAxiosPrivate from 'src/hooks/useAxiosPrivate';

export default function VerifyVendor() {
  return (
    <>
      <Typography variant="h1">Verify Vendor</Typography>
    </>
  );
}
