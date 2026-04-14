import { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Box,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import FilterListIcon from '@mui/icons-material/FilterList';
import SessionTable from './components/SessionTable';
import StartSessionDialog from './components/StartSessionDialog';
import MeterReadingDialog from './components/MeterReadingDialog';
import StopSessionDialog from './components/StopSessionDialog';
import SessionDetailDialog from './components/SessionDetailDialog';
import ChargerSummaryDialog from './components/ChargerSummaryDialog';
import EvStationIcon from '@mui/icons-material/EvStation';
import type { ISessionResponse, ISessionDetailResponse, TSessionStatus, IChargerSummaryResponse } from './types';
import * as api from './services/api';

export default function App() {
  // Session list state
  const [sessions, setSessions] = useState<ISessionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterChargerId, setFilterChargerId] = useState('');
  const [filterStatus, setFilterStatus] = useState<TSessionStatus | ''>('');
  const [listLoading, setListLoading] = useState(false);

  // Dialog states
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [meterDialogOpen, setMeterDialogOpen] = useState(false);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Selected session
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<ISessionDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Charger Summary
  const [summaryChargerId, setSummaryChargerId] = useState('');
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [chargerSummary, setChargerSummary] = useState<IChargerSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const fetchSessions = useCallback(async () => {
    setListLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filterChargerId.trim()) params.chargerId = filterChargerId.trim();
      if (filterStatus) params.status = filterStatus;

      const data = await api.listSessions(params);
      setSessions(data.sessions);
      setTotal(data.total);
    } catch {
      setSnackbar({
        open: true,
        message: `Failed to load sessions — is the backend running on ${api.API_URL} ?`,
        severity: 'error',
      });
    } finally {
      setListLoading(false);
    }
  }, [page, limit, filterChargerId, filterStatus]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleViewDetails = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await api.getSession(sessionId);
      setSessionDetail(data);
    } catch {
      setDetailError('Failed to load session details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddMeter = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMeterDialogOpen(true);
  };

  const handleStopSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setStopDialogOpen(true);
  };

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
    fetchSessions();
  };

  const handleViewSummary = async () => {
    if (!summaryChargerId.trim()) return;
    setSummaryDialogOpen(true);
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await api.getChargerSummary(summaryChargerId.trim());
      setChargerSummary(data);
    } catch {
      setSummaryError('Failed to load charger summary or charger not found.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#0D0D1A' }}>
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(21, 21, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(108, 99, 255, 0.12)',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <BoltIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            EVRA Session Console
          </Typography>
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchSessions}
              sx={{ color: 'text.secondary' }}
              id="refresh-sessions"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setStartDialogOpen(true)}
            id="start-session-btn"
          >
            Start Session
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Filters & Charger Lookup */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Filters */}
          <Paper
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              flex: '1 1 auto',
              alignItems: 'center',
              background: 'rgba(21, 21, 40, 0.6)',
            }}
          >
            <FilterListIcon sx={{ color: 'text.secondary' }} />
            <TextField
              id="filter-status"
              label="Status"
              select
              size="small"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as TSessionStatus | '');
                setPage(1);
              }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Faulted">Faulted</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterChargerId('');
                setFilterStatus('');
                setPage(1);
              }}
              size="small"
              sx={{ whiteSpace: 'nowrap', height: "40px" }}
            >
              Clear Filters
            </Button>
          </Paper>

          {/* Charger Summary Lookup */}
          <Paper
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              flex: '1 1 auto',
              alignItems: 'center',
              background: 'rgba(21, 21, 40, 0.6)',
            }}
          >
            <EvStationIcon sx={{ color: 'text.secondary' }} />
            <TextField
              id="charger-summary-id"
              label="Charger ID"
              size="small"
              value={summaryChargerId}
              onChange={(e) => setSummaryChargerId(e.target.value)}
              placeholder="e.g. CH-01"
              sx={{ minWidth: 140 }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleViewSummary}
              disabled={!summaryChargerId.trim()}
              size="small"
              sx={{ height: "40px" }}
            >
              View Summary
            </Button>
          </Paper>
        </Box>

        {/* Session Table */}
        <Paper
          sx={{
            overflow: 'hidden',
            background: 'rgba(21, 21, 40, 0.6)',
            ...(listLoading && { opacity: 0.6 }),
            transition: 'opacity 0.2s',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Charging Sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} total
            </Typography>
          </Box>
          <SessionTable
            sessions={sessions}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onViewDetails={handleViewDetails}
            onAddMeter={handleAddMeter}
            onStopSession={handleStopSession}
          />
        </Paper>
      </Container>

      {/* Dialogs */}
      <StartSessionDialog
        open={startDialogOpen}
        onClose={() => setStartDialogOpen(false)}
        onSessionCreated={() => showSuccess('Session started successfully!')}
      />

      <MeterReadingDialog
        open={meterDialogOpen}
        sessionId={selectedSessionId}
        onClose={() => setMeterDialogOpen(false)}
        onReadingSubmitted={() => showSuccess('Meter reading submitted!')}
      />

      <StopSessionDialog
        open={stopDialogOpen}
        sessionId={selectedSessionId}
        onClose={() => setStopDialogOpen(false)}
        onSessionStopped={() => showSuccess('Session stopped!')}
      />

      <SessionDetailDialog
        open={detailDialogOpen}
        session={sessionDetail}
        loading={detailLoading}
        error={detailError}
        onClose={() => {
          setDetailDialogOpen(false);
          setSessionDetail(null);
        }}
      />

      <ChargerSummaryDialog
        open={summaryDialogOpen}
        summary={chargerSummary}
        loading={summaryLoading}
        error={summaryError}
        onClose={() => {
          setSummaryDialogOpen(false);
          setChargerSummary(null);
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, minWidth: 300 }}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
