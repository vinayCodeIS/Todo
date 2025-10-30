import { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
  }, [status, priority, category]);

  const fetchTodos = async () => {
    try {
  let url = 'http://localhost:4000/todos/';
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (category) params.append('category', category);
      if (params.toString()) {
        url += '?' + params.toString();
      }
      const response = await axios.get(url);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
  await axios.delete(`http://localhost:4000/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TO DO': return 'error';
      case 'IN PROGRESS': return 'warning';
      case 'DONE': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="TO DO">To Do</MenuItem>
              <MenuItem value="IN PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="WORK">Work</MenuItem>
              <MenuItem value="HOME">Home</MenuItem>
              <MenuItem value="LEARNING">Learning</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Paper elevation={2}>
        <List>
          {todos.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography align="center">
                    No todos found. Try changing filters or add a new todo.
                  </Typography>
                } 
              />
            </ListItem>
          ) : (
            todos.map((todo) => (
              <ListItem
                key={todo.id}
                secondaryAction={
                  <>
                    <IconButton 
                      edge="end" 
                      aria-label="edit"
                      onClick={() => navigate(`/edit/${todo.id}`)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={todo.todo}
                  secondary={
                    <>
                      <Chip 
                        label={todo.status} 
                        size="small" 
                        color={getStatusColor(todo.status)}
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={todo.priority} 
                        size="small"
                        color={getPriorityColor(todo.priority)}
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={todo.category} 
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
}

export default TodoList;