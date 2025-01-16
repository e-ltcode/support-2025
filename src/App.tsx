import React, { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'

import './App.css';

import Categories from "categories/Categories"
import Answers from "groups/Groups"
import About from 'About';
import Health from 'Health';
import SupportPage from './SupportPage';
import { ILoginUser, IRegisterUser } from 'global/types';
import LoginForm from 'global/LoginForm';
import RegisterForm from 'global/RegisterForm';
import Roles from 'roles/Roles';
import { IUser } from 'roles/types';

function App() {

  const { getUser, registerUser, signInUser, OpenDB } = useGlobalContext();
  const { dbp, authUser, isAuthenticated, everLoggedIn } = useGlobalState()
  const { nickName, password, role } = authUser;

  const formInitialValues = {
    who: '',
    nickName: '',
    password: '',
    email: ''
  };

  let location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      //if (isAuthenticated) {
      await OpenDB();
      //}
    })()
  }, [OpenDB]) // , isAuthenticated

  const locationPathname = location.pathname;

  useEffect(() => {
    (async () => {
      const isAuthRoute =
        locationPathname.startsWith('/invitation') ||
        locationPathname.startsWith('/register') ||
        locationPathname.startsWith('/sign-in') ||
        locationPathname.startsWith('/about');  // allow about without registration
      if (!isAuthenticated && !isAuthRoute && dbp) {
        if (everLoggedIn) {
          let signedIn = false;
          if (/*dbp &&*/ nickName !== '') {
            console.log(`await signInUser(${nickName}, ${password} })`);
            const loginUser = {
              nickName
            }
            signedIn = await signInUser(loginUser);
            if (!signedIn) {
              navigate('/sign-in')
            }
          }
        }
        else {
          // const regUser: IRegisterUser = { 
          //   nickName
          // }
          // const user = await registerUser(regUser, true, null);

          // if (!user.confirmed) {
          //   let user: IUser = await getUser('Boss');
          //   const { nickName, name, password, wsId, email } = user;
          //   const loginUser: ILoginUser = { nickName  }
          //   user = await registerUser(loginUser, true);
          //   if (!user) {
          //     return null;
          //   }
          // }

          // let user = await getUser('Boss');
          // if (!user) {
          //   alert('User Boss, as the OWNER, should be in database')
          //   return;
          // }
          // if (!user.confirmed) {
          //   let user: IUser = await getUser('Boss');
          //   const { nickName, name, password, wsId, email } = user;
          //   const loginUser: ILoginUser = { wsId, nickName, name, password, email }
          //   user = await registerUser(loginUser);
          //   if (!user) {
          //     return null;
          //   }
          // }
          /*
          const returnUrl = encodeURIComponent(locationPathname);
          console.log('PATH prije navigate(register)', locationPathname)
          if (!locationPathname.includes('/register')) {
            navigate('/register/' + returnUrl, { replace: true });
          }
          */
        }
      }
    })()

  }, [dbp, signInUser, isAuthenticated, nickName, password, everLoggedIn, locationPathname, navigate])

  return (
    <Container fluid className="App">
      <header className="App-header">
        <Navigation />
      </header>
      <Row>
        <Col md={12}>
          <div className="wrapper">
            <Routes>
              <Route path="/:categoryId_questionId" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
              <Route path="/register/:returnUrl" element={<RegisterForm />} />
              <Route path="/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} />
              <Route path="/supporter/:source/:tekst" element={<SupportPage />} />
              <Route path="/supporter/:source/:tekst/:email" element={<SupportPage />} />
              <Route path="/categories/:categoryId_questionId" element={<Categories />} />
              <Route path="/answers" element={<Answers />} />
              <Route path="/users" element={<Roles />} />
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
