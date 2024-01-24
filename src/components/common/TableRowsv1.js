import { KeyboardArrowDown, KeyboardArrowUp, Check, DoDisturb, Edit } from '@mui/icons-material';
import { TableRow, TableCell, IconButton, Collapse, Typography, TextField, Tooltip } from '@mui/material';
import { useState } from 'react';

// row => object
// header => array of object

export default function Row({ header, row, length, DetComp }) {
  const [open, setOpen] = useState(false);
  const clickDetails = () => {
    setOpen(!open);
  };
  let x = 0;
  return (
    <>
      <TableRow key={row.id + 'row'}>
        {DetComp !== undefined && (
          <TableCell key={row.id + 'details'}>
            <IconButton key={row.id + 'detailsButton'} onClick={clickDetails}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        )}
        {header.map((item) => {
          const renderFun = item.renderCell;
          if (renderFun === undefined) {
            return (
              <TableCell key={row.id + item.data} align="left">
                <Typography key={row.id + item.data + 'text'}>{row[item.data]}</Typography>
              </TableCell>
            );
          } else {
            return (
              <TableCell key={row.id + item.header} align="center">
                {renderFun(row)}
              </TableCell>
            );
          }
        })}
      </TableRow>
      {DetComp !== undefined && (
        <TableRow key={row.id + 'rowDetail'}>
          <TableCell key={row.id + 'detailsCol'} colSpan={length} sx={{ padding: 0, margin: 0 }}>
            <Collapse key={row.id + 'collapsible'} in={open} timeout="auto" unmountOnExit>
              <DetComp data={row} trigger={open} />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
