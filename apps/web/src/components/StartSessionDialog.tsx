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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import type { IStartSessionInput } from '../types';
import * as api from '../services/api';

interface IStartSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onSessionCreated: () => void;
}

export default function StartSessionDialog({
  open,
  onClose,
  onSessionCreated,
}: IStartSessionDialogProps) {
  const [chargerId, setChargerId] = useState('');
  const [connectorId, setConnectorId] = useState('');
  const [idTag, setIdTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!chargerId.trim() || !connectorId.trim() || !idTag.trim()) {
      setError('All fields are required');
      return;
    }

    const connectorNum = parseInt(connectorId, 10);
    if (isNaN(connectorNum) || connectorNum <= 0) {
      setError('Connector ID must be a positive number');
      return;
    }

    const input: IStartSessionInput = {
      chargerId: chargerId.trim(),
      connectorId: connectorNum,
      idTag: idTag.trim(),
    };

    setLoading(true);
    try {
      await api.startSession(input);
      handleClose();
      onSessionCreated();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        if (axiosErr.response?.status === 409) {
          setError(axiosErr.response.data?.message || 'Duplicate session on this connector');
        } else {
          setError(axiosErr.response?.data?.message || 'Failed to start session');
        }
      } else {
        setError('Network error — is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChargerId('');
    setConnectorId('');
    setIdTag('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddCircleIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Start New Session</Typography>
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
            id="start-charger-id"
            label="Charger ID"
            placeholder="e.g. CH-01"
            value={chargerId}
            onChange={(e) => setChargerId(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            id="start-connector-id"
            label="Connector ID"
            placeholder="e.g. 1"
            type="number"
            value={connectorId}
            onChange={(e) => setConnectorId(e.target.value)}
            fullWidth
          />
          <TextField
            id="start-id-tag"
            label="User ID Tag"
            placeholder="e.g. USER-42"
            value={idTag}
            onChange={(e) => setIdTag(e.target.value)}
            fullWidth
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
          id="start-session-submit"
        >
          {loading ? 'Starting...' : 'Start Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
