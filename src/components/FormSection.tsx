'use client';

import { Paper, Typography, Box } from '@mui/material';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function FormSection({ title, children }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Box>
        {children}
      </Box>
    </Paper>
  );
}
