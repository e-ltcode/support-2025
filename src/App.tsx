import React, { useEffect } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route, redirect, useLocation, useNavigate } from "react-router-dom";

import { Navigation } from 'Navigation'
import { useGlobalContext, useGlobalDispatch, useGlobalState } from 'global/GlobalProvider'
import { ThemeProvider } from './theme/ThemeProvider';
import Footer from './components/Footer';

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
import ChatBotPage from 'ChatBotPage';
import Export from 'Export';

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
              navigate('/support-2025/sign-in')
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
    <ThemeProvider>
      <Container fluid className="App" data-bs-theme="light">
        <header className="App-header">
          <Navigation />
        </header>
        <Row>
          <Col md={12}>
            <div className="wrapper">
              <Routes>
                <Route path="/support-2025/" element={(!isAuthenticated && !everLoggedIn) ? <About /> : <Categories />} />
                <Route path="/support-2025/register/:returnUrl" element={<RegisterForm />} />
                <Route path="/support-2025/sign-in" element={<LoginForm initialValues={formInitialValues} invitationId='' />} />
                <Route path="/support-2025/supporter/:source/:tekst" element={<SupportPage />} />
                <Route path="/support-2025/supporter/:source/:tekst/:email" element={<SupportPage />} />
                <Route path="/support-2025/ChatBotPage/:source/:tekst/:email" element={<ChatBotPage />} />
                <Route path="/support-2025/categories/:categoryId_questionId" element={<Categories />} />
                <Route path="/support-2025/categories" element={<Categories />} />
                <Route path="/support-2025/answers" element={<Answers />} />
                <Route path="/support-2025/users" element={<Roles />} />
                <Route path="/support-2025/export" element={<Export />} />
                <Route path="/support-2025/about" element={<About />} />
                <Route path="/support-2025/health" element={<Health />} />
              </Routes>
            </div>
          </Col>
        </Row>
        <Footer />
      </Container>
    </ThemeProvider>
  );
}

export default App;
