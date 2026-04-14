import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  TablePagination,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BoltIcon from '@mui/icons-material/Bolt';
import type { ISessionResponse } from '../types';

interface ISessionTableProps {
  sessions: ISessionResponse[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (sessionId: string) => void;
  onAddMeter: (sessionId: string) => void;
  onStopSession: (sessionId: string) => void;
}

export default function SessionTable({
  sessions,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onAddMeter,
  onStopSession,
}: ISessionTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'primary';
      case 'Faulted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRowStyle = (status: string) => {
    if (status === 'Faulted') {
      return {
        background: 'rgba(255, 92, 92, 0.04)',
        borderLeft: '3px solid',
        borderLeftColor: 'error.main',
      };
    }
    if (status === 'Active') {
      return {
        borderLeft: '3px solid',
        borderLeftColor: 'success.main',
      };
    }
    return {
      borderLeft: '3px solid transparent',
    };
  };

  if (sessions.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <BoltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.4 }} />
        <Typography variant="h6" color="text.secondary">
          No sessions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start a new session to see it here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session ID</TableCell>
              <TableCell>Charger ID</TableCell>
              <TableCell>Connector</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Energy (Wh)</TableCell>
              <TableCell>Started</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow
                key={session.sessionId}
                sx={{
                  ...getRowStyle(session.status),
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: 'rgba(108, 99, 255, 0.06)',
                  },
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'primary.light',
                    }}
                  >
                    {session.sessionId}
                  </Typography>
                </TableCell>
                <TableCell>{session.chargerId}</TableCell>
                <TableCell>{session.connectorId}</TableCell>
                <TableCell>{session.idTag}</TableCell>
                <TableCell>
                  <Chip
                    label={session.status}
                    color={getStatusColor(session.status) as 'success' | 'primary' | 'error' | 'default'}
                    size="small"
                    variant="filled"
                    sx={{
                      ...(session.status === 'Faulted' && {
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(255, 92, 92, 0.4)' },
                          '70%': { boxShadow: '0 0 0 6px rgba(255, 92, 92, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(255, 92, 92, 0)' },
                        },
                      }),
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {session.totalEnergyWh.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(session.startTime).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewDetails(session.sessionId)}
                        sx={{ color: 'primary.light' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {session.status === 'Active' && (
                      <>
                        <Tooltip title="Add Meter Reading">
                          <IconButton
                            size="small"
                            onClick={() => onAddMeter(session.sessionId)}
                            sx={{ color: 'secondary.main' }}
                          >
                            <SpeedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Stop Session">
                          <IconButton
                            size="small"
                            onClick={() => onStopSession(session.sessionId)}
                            sx={{ color: 'error.main' }}
                          >
                            <StopCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        onPageChange={(_e, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      />
    </Box>
  );
}
