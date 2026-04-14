import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import EvStationIcon from '@mui/icons-material/EvStation';
import BoltIcon from '@mui/icons-material/Bolt';
import type { IChargerSummaryResponse } from '../types';

interface IChargerSummaryDialogProps {
  open: boolean;
  summary: IChargerSummaryResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function ChargerSummaryDialog({
  open,
  summary,
  loading,
  error,
  onClose,
}: IChargerSummaryDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EvStationIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Charger Summary</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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

          {summary && !loading && (
            <Paper
              sx={{
                p: 3,
                background: 'rgba(108, 99, 255, 0.05)',
                border: '1px solid rgba(108, 99, 255, 0.12)',
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Charger ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {summary.chargerId}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Active Sessions
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {summary.activeSessions}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Lifetime Sessions
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {summary.totalSessions}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Energy Dispensed
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    <BoltIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', color: 'warning.main' }} />{' '}
                    {summary.totalEnergyWh.toLocaleString()} Wh
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
