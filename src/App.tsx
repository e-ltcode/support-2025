import React, { useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from './logo.svg';
// import { Zovi } from './toDo.js'
import './App.css';
import { Col, Container, Row } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import { Navigation } from 'Navigation'
import Categories from 'categories/Categories';
import About from 'About';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';
import { ILoginUser } from 'global/types.js';
import Health from 'Health';


function App() {

  useEffect(() => {
    (async () => {
      // Zovi();
    })()
  }, []);


  const { signInUser, openDB } = useGlobalContext();
  const { isAuthenticated, everLoggedIn } = useGlobalState(); 
  
  useEffect(() => {
    (async () => {
      // Authenticate
      const loginUser: ILoginUser = {
        userName: 'Slavko',
        wsName: 'Workspace',
        password: ''

      }
      // const signedIn = await signInUser(loginUser);
      // console.log('await signInUser({ loginUser })');
      // if (signedIn) {
        await openDB();
      // }
    })()
  }, [signInUser, openDB])


  return (
    <Container fluid className="App">
      <header className="App-header">
        <Navigation />
      </header>
      <Row>
        <Col md={12}>
          <div className="wrapper">
            <Routes>
              <Route path="/" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
              <Route path="/categories/:categoryId_questionId" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/health" element={<Health />} />
            </Routes>
          </div>
        </Col>
      </Row>
    </Container>
  )

}

export default App;
