import Converter from "./Converter";
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import './Converter.css';


function App() {
  return (
    <div className="app-container"  >
      <Container >
        <div >
          <Box className="box" >
            <Converter />
          </Box>
        </div>
      </Container>
    </div>
  );
}

export default App;
