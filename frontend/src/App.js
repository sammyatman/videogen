import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

const ModelCard = ({ model, onDragStart }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'model',
    drop: () => model,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <Paper
      ref={drop}
      elevation={isOver ? 4 : 1}
      sx={{
        p: 2,
        cursor: 'move',
        '&:hover': {
          opacity: 0.9,
        },
      }}
      draggable
      onDragStart={(e) => onDragStart(e, model)}
    >
      <Box display="flex" alignItems="center">
        <DragIndicatorIcon sx={{ mr: 1 }} />
        <Typography>{model.name}</Typography>
      </Box>
    </Paper>
  );
};

function App() {
  const [prompt, setPrompt] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const availableModels = [
    { name: 'Stable Diffusion', id: 'sd' },
    { name: 'Midjourney', id: 'mj' },
    { name: 'DALL-E', id: 'dalle' },
    { name: 'FAL AI', id: 'fal' },
  ];

  const handleGenerate = async () => {
    if (!prompt || selectedModels.length < 2) {
      setError('Please enter a prompt and select at least 2 models');
      return;
    }

    setError('');
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('http://localhost:5000/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          models: selectedModels.map(m => m.id),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate images');
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, model) => {
    e.dataTransfer.setData('text/plain', model.id);
  };

  const handleDrop = (e) => {
    const modelId = e.dataTransfer.getData('text/plain');
    const model = availableModels.find(m => m.id === modelId);
    if (model && !selectedModels.some(m => m.id === modelId)) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI Image Generation Showdown
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Prompt"
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Available Models
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {availableModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onDragStart={handleDragStart}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Selected Models
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  minHeight: 200,
                  border: '2px dashed grey',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {selectedModels.map((model) => (
                  <Paper
                    key={model.id}
                    sx={{ p: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <Typography>{model.name}</Typography>
                  </Paper>
                ))}
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || selectedModels.length < 2 || !prompt}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Generate Images
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>

          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Grid container spacing={3}>
                {results.map((result) => (
                  <Grid item xs={12} sm={6} md={4} key={result.model}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {result.model}
                      </Typography>
                      {result.status === 'pending' ? (
                        <CircularProgress />
                      ) : (
                        <img
                          src={result.result.imageUrl}
                          alt={result.model}
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </DndProvider>
  );
}

export default App;
