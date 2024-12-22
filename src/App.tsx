import React, { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'

import './App.css';

import Categories from "categories/Categories"
import About from 'About';
import Health from 'Health';
import SupportPage from './SupportPage';
import { ILoginUser } from 'global/types';
import LoginForm from 'global/LoginForm';
import RegisterForm from 'global/RegisterForm';

function App() {

  const { signInUser, OpenDB } = useGlobalContext();
  const { authUser, isAuthenticated, everLoggedIn } = useGlobalState()
  const { wsId, wsName, userName, password } = authUser;

  const formInitialValues = {
    wsName: '',
    wsId: '',
    who: '',
    userName: '',
    password: '',
    email: ''
  };

  let location = useLocation();
  const navigate = useNavigate();

  const locationPathname = location.pathname;

  useEffect(() => {
    (async () => {
      const isAuthRoute =
        locationPathname.startsWith('/invitation') ||
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without egistration
      if (!isAuthenticated && !isAuthRoute) {
        if (everLoggedIn) {
          let signedIn = false;
          if (userName !== '') {
            console.log(`await signInUser(${ wsId}, ${wsName}, ${userName}, ${password} })`);
            const loginUser = {
              wsId, wsName, userName, password, email: '' 
            }
            signedIn = await signInUser(loginUser);
            if (!signedIn) {
              navigate('/sign-in')
            }
          }         
        }
        else {
          const returnUrl = encodeURIComponent(locationPathname);
          console.log('PATH prije navigate(register)', locationPathname)
          if (!locationPathname.includes('/register'))
            navigate('/register/' + returnUrl, { replace: true })
        }
      }
    })()

    }, [signInUser, isAuthenticated, wsId, wsName, userName, password, everLoggedIn, locationPathname, navigate])

    useEffect(() => {
      (async () => {
        if (isAuthenticated) {
          await OpenDB();
        }
      })()
    }, [OpenDB, isAuthenticated])


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
                <Route path="/register/:returnUrl" element={<RegisterForm />} />
                <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} />
                <Route path="/supporter/:source/:tekst" element={<SupportPage />} />
                <Route path="/supporter/:source/:tekst/:email" element={<SupportPage />} />
                <Route path="/categories/:categoryId_questionId" element={<Categories />} />
                <Route path="/about" element={<About />} />
                <Route path="/health" element={<Health />} />
              </Routes>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

export default App;
