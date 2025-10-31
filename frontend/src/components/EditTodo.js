import { useState, useEffect } from 'react';
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
  Typography,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditTodo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [todo, setTodo] = useState({
    todo: '',
    priority: '',
    status: '',
    category: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodo();
  }, [id]);

  const fetchTodo = async () => {
    try {
  const response = await axios.get(`http://localhost:4000/todos/${id}`);
      setTodo({
        ...response.data,
        dueDate: response.data.due_date ? response.data.due_date.split('T')[0] : (response.data.dueDate || '')
      });
      setLoading(false);
    } catch (error) {
      setError('Error loading todo');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send payload using backend expected field names (snake_case)
      const payload = {
        ...todo,
        due_date: todo.dueDate
      };

      await axios.put(`http://localhost:4000/todos/${id}`, payload);
      navigate('/');
    } catch (error) {
      setError(error.response?.data || 'Error updating todo');
    }
  };

  const handleChange = (e) => {
    setTodo({
      ...todo,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Edit Todo
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
                Update Todo
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

export default EditTodo;