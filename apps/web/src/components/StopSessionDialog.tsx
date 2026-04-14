import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import type { IStopSessionInput } from '../types';
import * as api from '../services/api';

interface IStopSessionDialogProps {
  open: boolean;
  sessionId: string | null;
  onClose: () => void;
  onSessionStopped: () => void;
}

export default function StopSessionDialog({
  open,
  sessionId,
  onClose,
  onSessionStopped,
}: IStopSessionDialogProps) {
  const [energyWh, setEnergyWh] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!sessionId) {
      setError('No session selected');
      return;
    }

    if (!energyWh.trim()) {
      setError('Final energy (Wh) is required');
      return;
    }

    const energyNum = parseFloat(energyWh);
    if (isNaN(energyNum) || energyNum < 0) {
      setError('Energy must be a non-negative number');
      return;
    }

    const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    const input: IStopSessionInput = {
      energyWh: energyNum,
      timestamp: ts,
    };

    setLoading(true);
    try {
      await api.stopSession(sessionId, input);
      handleClose();
      onSessionStopped();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to stop session');
      } else {
        setError('Network error — is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEnergyWh('');
    setTimestamp('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StopCircleIcon sx={{ color: 'error.main' }} />
          <Typography variant="h6">
            Stop Session — <code style={{ color: '#6C63FF' }}>{sessionId}</code>
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {error && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            id="stop-energy-wh"
            label="Final Energy (Wh)"
            placeholder="e.g. 8400"
            type="number"
            value={energyWh}
            onChange={(e) => setEnergyWh(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            id="stop-timestamp"
            label="End Timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            fullWidth
            helperText="Leave blank to use current timestamp"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading}
          id="stop-session-submit"
          sx={{
            background: 'linear-gradient(135deg, #FF5C5C 0%, #FF7D7D 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #D44848 0%, #FF5C5C 100%)',
            },
          }}
        >
          {loading ? 'Stopping...' : 'Stop Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
