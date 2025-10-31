import { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddTodo() {
  const navigate = useNavigate();
  const [todo, setTodo] = useState({
    todo: '',
    priority: '',
    status: '',
    category: '',
    dueDate: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the next available ID (in a real app, this would be handled by the backend)
  const response = await axios.get('http://localhost:4000/todos/');
      const nextId = Math.max(...response.data.map(t => t.id), 0) + 1;
      // Normalize payload to backend expected fields (snake_case)
      const payload = {
        id: nextId,
        todo: todo.todo,
        priority: todo.priority,
        status: todo.status,
        category: todo.category,
        due_date: todo.dueDate
      };

      await axios.post('http://localhost:4000/todos/', payload);
      navigate('/');
    } catch (error) {
      setError(error.response?.data || 'Error adding todo');
    }
  };

  const handleChange = (e) => {
    setTodo({
      ...todo,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Add New Todo
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Todo"
              name="todo"
              value={todo.todo}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={todo.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={todo.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="TO DO">To Do</MenuItem>
                <MenuItem value="IN PROGRESS">In Progress</MenuItem>
                <MenuItem value="DONE">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={todo.category}
                label="Category"
                onChange={handleChange}
              >
                <MenuItem value="WORK">Work</MenuItem>
                <MenuItem value="HOME">Home</MenuItem>
                <MenuItem value="LEARNING">Learning</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={todo.dueDate}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            {error && (
              <Typography color="error">
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
                fullWidth
              >
                Add Todo
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
                fullWidth
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default AddTodo;