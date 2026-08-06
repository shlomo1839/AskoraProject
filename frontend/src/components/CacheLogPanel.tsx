import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import StorageIcon from '@mui/icons-material/Storage';
import {
  cacheLogStore,
  type CacheLogEvent,
  type CacheLogKind,
} from '../services/cacheLogStore';

const KIND_STYLES: Record<
  CacheLogKind,
  { label: string; color: string; bg: string }
> = {
  HIT: { label: 'HIT', color: '#1b5e20', bg: '#c8e6c9' },
  MISS: { label: 'MISS', color: '#b71c1c', bg: '#ffcdd2' },
  INVALIDATE: { label: 'INVALIDATE', color: '#e65100', bg: '#ffe0b2' },
};

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function CacheLogPanel() {
  const [events, setEvents] = useState<CacheLogEvent[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => cacheLogStore.subscribe(setEvents), []);

  if (!open) {
    return (
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="הצג לוגי Cache"
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1400,
          bgcolor: '#263238',
          color: '#fff',
          boxShadow: 3,
          '&:hover': { bgcolor: '#37474f' },
        }}
      >
        <StorageIcon />
      </IconButton>
    );
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1400,
        width: { xs: 'calc(100vw - 32px)', sm: 380 },
        maxHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#1e1e1e',
        color: '#eee',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderBottom: '1px solid #333',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Cache Live Logs
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => cacheLogStore.clear()}
            aria-label="נקה לוגים"
            sx={{ color: '#bbb' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            aria-label="סגור"
            sx={{ color: '#bbb' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto', px: 1.5, py: 1, flex: 1 }}>
        {events.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#888', py: 2, textAlign: 'center' }}>
            אין אירועי Cache עדיין — בצע פעולה באפליקציה
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {events.map((event, index) => {
              const style = KIND_STYLES[event.kind];
              return (
                <Box
                  key={`${event.at}-${event.key}-${index}`}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: '#2a2a2a',
                    borderRight: `3px solid ${style.color}`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Chip
                      size="small"
                      label={style.label}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        bgcolor: style.bg,
                        color: style.color,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {formatTime(event.at)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}
                  >
                    {event.key}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#aaa' }}>
                    {event.message}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
