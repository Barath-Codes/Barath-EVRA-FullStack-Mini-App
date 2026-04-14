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
import SpeedIcon from '@mui/icons-material/Speed';
import type { IMeterReadingInput } from '../types';
import * as api from '../services/api';

interface IMeterReadingDialogProps {
  open: boolean;
  sessionId: string | null;
  onClose: () => void;
  onReadingSubmitted: () => void;
}

export default function MeterReadingDialog({
  open,
  sessionId,
  onClose,
  onReadingSubmitted,
}: IMeterReadingDialogProps) {
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
      setError('Energy (Wh) is required');
      return;
    }

    const energyNum = parseFloat(energyWh);
    if (isNaN(energyNum) || energyNum < 0) {
      setError('Energy must be a non-negative number');
      return;
    }

    const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    const input: IMeterReadingInput = {
      energyWh: energyNum,
      timestamp: ts,
    };

    setLoading(true);
    try {
      await api.submitMeterReading(sessionId, input);
      handleClose();
      onReadingSubmitted();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to submit meter reading');
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
          <SpeedIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6">
            Add Meter Reading — <code style={{ color: '#6C63FF' }}>{sessionId}</code>
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
            id="meter-energy-wh"
            label="Energy (Wh)"
            placeholder="e.g. 2500"
            type="number"
            value={energyWh}
            onChange={(e) => setEnergyWh(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            id="meter-timestamp"
            label="Timestamp"
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
          disabled={loading}
          id="meter-reading-submit"
        >
          {loading ? 'Submitting...' : 'Submit Reading'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
