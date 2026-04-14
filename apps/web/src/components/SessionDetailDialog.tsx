import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BoltIcon from '@mui/icons-material/Bolt';
import type { ISessionDetailResponse } from '../types';

interface ISessionDetailDialogProps {
  open: boolean;
  session: ISessionDetailResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function SessionDetailDialog({
  open,
  session,
  loading,
  error,
  onClose,
}: ISessionDetailDialogProps) {
  if (!open) return null;

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Session Details</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {session && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Session Info */}
            <Paper
              sx={{
                p: 2.5,
                background: 'rgba(108, 99, 255, 0.05)',
                border: '1px solid rgba(108, 99, 255, 0.12)',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Session ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {session.sessionId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Charger
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {session.chargerId} / Connector {session.connectorId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {session.idTag}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.3 }}>
                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status) as 'success' | 'primary' | 'error' | 'default'}
                      size="small"
                      variant="filled"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Energy
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    <BoltIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', color: 'warning.main' }} />{' '}
                    {session.totalEnergyWh.toLocaleString()} Wh
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body2">
                    {new Date(session.startTime).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Meter Readings */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
                Meter Readings ({session.meterReadings.length})
              </Typography>
              {session.meterReadings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No meter readings recorded yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Energy (Wh)</TableCell>
                        <TableCell>Timestamp</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {session.meterReadings.map((reading, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {reading.energyWh.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {new Date(reading.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            {/* Anomalies — shown if any exist */}
            {session.anomalies.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <WarningAmberIcon sx={{ color: 'error.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main' }}>
                      Anomalies ({session.anomalies.length})
                    </Typography>
                  </Box>
                  {session.anomalies.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No anomalies recorded.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Detected At</TableCell>
                            <TableCell>Details</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {session.anomalies.map((anomaly, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Chip
                                  label={anomaly.type}
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(anomaly.detectedAt).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {anomaly.details ? (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: 'monospace',
                                      fontSize: '0.8rem',
                                      background: 'rgba(255, 92, 92, 0.08)',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {Object.entries(anomaly.details)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' → ')}
                                  </Typography>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
