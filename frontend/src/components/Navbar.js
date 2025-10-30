import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Todo Application
        </Typography>
        <Button 
          color="inherit" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/add')}
        >
          Add Todo
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;