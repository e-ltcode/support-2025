import React, { useEffect } from 'react';
// import logo from './logo.svg';
import { Zovi } from './toDo.js'
import './App.css';
import { Col, Container, Row } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import { Navigation } from 'Navigation'
import Categories from 'categories/Categories';
import About from 'About';
import { useGlobalContext } from 'global/GlobalProvider';
import { ILoginUser } from 'global/types.js';

function App() {

  useEffect(() => {
    // Zovi();
  }, [])

  const { signInUser } = useGlobalContext();

  const { isAuthenticated, everLoggedIn } = { isAuthenticated: true, everLoggedIn: true }

  useEffect(() => {
    (async () => {
      const loginUser: ILoginUser = {
        userName: 'Slavko',
        wsName: 'Workspace',
        password: ''
      
      }
      const signedIn = await signInUser(loginUser);
      console.log('await signInUser({ loginUser })')
    })()
  }, [signInUser, isAuthenticated, everLoggedIn])

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
            </Routes>
          </div>
        </Col>
      </Row>
    </Container>
  )

}

export default App;
