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
import { useGlobalContext } from 'global/GlobalProvider';
import { ILoginUser } from 'global/types.js';
import Health from 'Health';

//////////////////
// Initial data
import data from 'question-groups.json';
import { IQuestionGroupData, IQuestionData } from 'global/types'
import { ICategory, IQuestion } from 'categories/types';

function App() {

  useEffect(() => {
    (async () => {
      // Zovi();
      const DBOpenRequest = window.indexedDB.open('SupportKnowledge', 1);

      // Register two event handlers to act on the database being opened successfully, or not
      DBOpenRequest.onerror = (event) => {
        alert('Error loading database SupportKnowledge.')
      };

      let db: IDBDatabase | null;
      DBOpenRequest.onsuccess = async (event) => {
        console.log('Database initialised SupportKnowledge.');
        // Store the result of opening the database in the db variable. This is used a lot below
        db = DBOpenRequest.result;
        // Run the displayData() function to populate the task list with all the to-do list data already in the IndexedDB
        // displayData();


      }
      // This event handles the event whereby a new version of the database needs to be created
      // Either one has not been created before, or a new version number has been submitted via the
      // window.indexedDB.open line above
      //it is only implemented in recent browsers
      DBOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        db = event && event.target && (event.target as any).result;

        DBOpenRequest.onerror = (event: Event) => {
          console.error('Error loading database.');
        };

        // Create an objectStore for this database
        const objectStore = db!.createObjectStore('QuestionGroup', { autoIncrement: true });
        objectStore.createIndex('title', 'title', { unique: true });

        // create an objectStore for Question
        const objectStore2 = db!.createObjectStore('Question', { autoIncrement: true });
        objectStore2.createIndex('categoryId', 'categoryId', { unique: false });
        objectStore2.createIndex('title', 'title', { unique: true });

        const txn: IDBTransaction = event && event.target && (event.target as any).transaction;
        txn.oncomplete = () => {
          addQuestions(db!);
        }
      }
    })()
  }, []);


  const addQuestions = async (db: IDBDatabase): Promise<void> => {
    new Promise<void>((resolve) => {
      // Open a read/write DB transaction, ready for adding the data
      const transaction = db!.transaction(['QuestionGroup', 'Question'], 'readwrite');
      transaction.oncomplete = () => {
        console.log('trans complete')
        resolve();
      };
      transaction.onerror = () => {
        //alert(`${transaction.error}`);
        console.log(`${transaction.error}`);
      };
      const groupStore = transaction.objectStore('QuestionGroup');
      const questionStore = transaction.objectStore('Question');

      data.forEach(g => {
        const group: ICategory = {
          title: g.title,
          level: 1,
          questions: []
        }
        console.log('group', group);
        const groupRequest = groupStore.add(group);
        groupRequest.onsuccess = (event) => {
          console.log('dodao group');
          const groupId: IDBValidKey = groupRequest.result;
          // add questions
          g.questions.forEach(q => {
            const question: IQuestion = {
              groupId,
              title: q.title,
              source: q.source,
              status: q.status,
              questionAnswers: []
            }
            console.log('question', question)
            const questionRequest = questionStore.add(question);
            questionRequest.onsuccess = (event) => {
              console.log('dodao question')
            }
          })
        }
      })
    })
  }


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
