import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGear, faCircleQuestion, faComments, faRobot, faUser } from '@fortawesome/free-solid-svg-icons'

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';

import { useGlobalContext, useGlobalDispatch } from 'global/GlobalProvider'
import { ROLES, GlobalActionTypes } from "global/types";
import { useEffect } from "react";

interface INavigation {
}

export function Navigation(props: INavigation) {
  const { globalState } = useGlobalContext();
  const { authUser, isAuthenticated, isDarkMode, variant, bg } = globalState;
  const { nickName, role } = authUser;
  const [expanded, setExpanded] = useState(false);

  let enumRole: ROLES = role === 'OWNER'
    ? ROLES.OWNER
    : role === 'ADMIN'
      ? ROLES.ADMIN
      : role === 'EDITOR'
        ? ROLES.EDITOR
        : ROLES.VIEWER

  const dispatch = useGlobalDispatch();
  let navigate = useNavigate();

  const otkaciMe = () => {
    dispatch({ type: GlobalActionTypes.UN_AUTHENTICATE })
    localStorage.removeItem('CATEGORIES_STATE');
    navigate('/support-2025/about');
  }

  const closeMenu = () => {
    if (window.innerWidth < 768) {
      setExpanded(false);
    }
  };

  useEffect(() => {
    // if (isAuthenticated)
    //   navigate('/categories')
  }, [navigate, isAuthenticated])

  return (
    <Navbar expand={"md"} variant={variant} bg={bg} expanded={expanded} onToggle={setExpanded} className="sticky-top">
      <Container fluid>
        <Navbar.Brand href="#" className="ps-3"><i>Support Knowledge</i></Navbar.Brand>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand`} />
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand`}
          aria-labelledby={`offcanvasNavbarLabel-expand`}
          placement="end"
          className={`text-bg-${bg}`}
          show={expanded}
          onHide={() => setExpanded(false)}
        >
          {isDarkMode ? (
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>Support</Offcanvas.Title>
            </Offcanvas.Header>
          ) : (
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand`}>Support</Offcanvas.Title>
            </Offcanvas.Header>
          )}

          <Offcanvas.Body>
            <Nav
              className="justify-content-end flex-grow-1 pe-3 d-flex flex-nowrap"
              onSelect={eventKey => {
                closeMenu();
                switch (eventKey) {
                  case "LIGHT_MODE":
                  case "DARK_MODE":
                    document.body.classList.remove('dark', 'light');
                    document.body.classList.add(eventKey === "DARK_MODE" ? 'dark' : 'light');
                    dispatch({ type: eventKey })
                    break;
                }
              }}
            >
              {isAuthenticated &&
                <NavLink to={`/support-2025/supporter/0/${encodeURIComponent('radi bater')}/xyz`} className="nav-link" onClick={() => {
                  closeMenu();
                }}>
                  <FontAwesomeIcon icon={faUserGear} color='lightblue' />{' '}Supporter <small>(QA)</small>
                </NavLink>
              }
              {isAuthenticated &&
                <NavLink to="/support-2025/categories" className="nav-link" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faCircleQuestion} color='lightblue' />{' '}Questions
                </NavLink>
              }
              {isAuthenticated &&
                <NavLink to="/support-2025/answers" className="nav-link" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faComments} color='lightblue' />{' '}Answers
                </NavLink>
              }

              {isAuthenticated && (ROLES.OWNER === enumRole || ROLES.ADMIN === enumRole) &&
                <NavLink to="/support-2025/users" className="nav-link" onClick={closeMenu}>
                  <FontAwesomeIcon icon={faUserGear} color='lightblue' />{' '}Users
                </NavLink>
              }

              {isAuthenticated &&
                <NavLink to={`/support-2025/ChatBotPage/0/${encodeURIComponent('radi extension')}/xyz`} className="nav-link" onClick={() => {
                  closeMenu();
                }}>
                  <FontAwesomeIcon icon={faRobot} color='lightblue' />{' '}ChatBot
                </NavLink>
              }

              {!isAuthenticated &&
                <NavLink to="/support-2025/about" className="nav-link" onClick={closeMenu}>
                  About
                </NavLink>
              }

              {!isAuthenticated &&
                <NavLink to="/support-2025/register/fromNavigation/" className="nav-link" onClick={closeMenu}>
                  Register
                </NavLink>
              }

              {!isAuthenticated &&
                <NavLink to="/support-2025/sign-in" className="nav-link" onClick={closeMenu}>
                  Sign In
                </NavLink>
              }

              {isAuthenticated &&
                <NavDropdown
                  title={<><FontAwesomeIcon icon={faUser} />{' '}{nickName}</>}
                  id={`offcanvasNavbarDropdown-expand`}
                  menuVariant={variant}
                  align="end"
                >
                  <NavDropdown.Item eventKey="DARK_MODE">
                    Dark mode
                  </NavDropdown.Item>
                  <NavDropdown.Item eventKey="LIGHT_MODE">
                    Light mode
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/support-2025/export" onClick={closeMenu}>
                    Export Database to JSON
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/support-2025/health" onClick={closeMenu}>
                    Health
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/support-2025/about" onClick={closeMenu}>
                    About
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#" onClick={() => { closeMenu(); otkaciMe(); }}>
                    Sign out
                  </NavDropdown.Item>
                </NavDropdown>
              }
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
