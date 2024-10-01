import { useState, Fragment } from 'react';
import {
  Table,
  TableContainer,
  Typography,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const columns = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      return (
        row.getCanExpand() && (
          <IconButton onClick={row.getToggleExpandedHandler()}>
            {row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )
      );
    },
  },
  {
    header: 'Vendor Code',
    accessorKey: 'ven_code',
    cell: (props) => props.getValue(),
  },
  {
    header: 'Vendor Name',
    accessorKey: 'ven_name',
    cell: (props) => props.getValue(),
  },
  {
    header: 'Requestor',
    accessorKey: 'prc_id',
    cell: (props) => props.getValue(),
  },
  {
    header: 'Email PIC',
    accessorKey: 'email_pic',
    cell: (props) => props.getValue(),
  },
  {
    header: 'No Telp PIC',
    accessorKey: 'no_telf_pic',
    cell: (props) => props.getValue(),
  },
  {
    header: 'Alamat 1',
    accessorKey: 'street',
    cell: (props) => props.getValue(),
  },
  {
    header: 'City',
    accessorKey: 'city',
    cell: (props) => props.getValue(),
  },
];

const childTable = ({ row }) => {
  return <Typography>Child Table</Typography>;
};

export default function VerifyVendor() {
  const [data, _setData] = useState();
  const [expand, setExpand] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded: expand,
    },
    getRowCanExpand: () => true,
    onExpandedChange: setExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <>
      <Typography variant="h1">Verify Vendor</Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell component="th" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {row.getIsExpanded() && (
                    <TableCell colSpan={row.getVisibleCells().length}>{childTable({ row })}</TableCell>
                  )}
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
