import React from 'react';
import { useEffect, useState } from 'react'
import { Container, Row, Col, Button, Modal, Stack, DropdownButton, Dropdown } from "react-bootstrap";

import { useParams } from 'react-router-dom';

import { Mode, ActionTypes } from "./types";

import { CategoryProvider, useCategoryContext, useCategoryDispatch } from "./CategoryProvider";

import CategoryList from "categories/components/CategoryList";
import ViewCategory from "categories/components/ViewCategory";
import EditCategory from "categories/components/EditCategory";
import { useGlobalState } from 'global/GlobalProvider';


interface IProps {
    categoryId_questionId: string | undefined
}

const Providered = ({ categoryId_questionId }: IProps) => {
    const { state, reloadCategoryNode } = useCategoryContext();
    const { lastCategoryExpanded, categoryId_questionId_done } = state;

    const { isDarkMode, authUser } = useGlobalState();    
    
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const handleClose = () => setShowAddQuestion(false);

    //const [newQuestion, setNewQuestion] = useState({ ...initialQuestion, wsId: authUser.wsId });
    const [createQuestionError, setCreateQuestionError] = useState("");

    const dispatch = useCategoryDispatch();

    useEffect(() => {
        (async () => {
            
            if (categoryId_questionId) {
                if (categoryId_questionId === 'add_question') {
                    const sNewQuestion = localStorage.getItem('New_Question');
                    if (sNewQuestion) {
                        const q = JSON.parse(sNewQuestion);
                        //setNewQuestion({ ...initialQuestion, categoryTitle: 'Select', ...q })
                        setShowAddQuestion(true);
                        localStorage.removeItem('New_Question')
                    }
                }
                else if (categoryId_questionId !== categoryId_questionId_done) {
                    const arr = categoryId_questionId.split('_');
                    const categoryId = arr[0];
                    const questionId = arr[1];
                    await reloadCategoryNode(categoryId, questionId);
                }
            }
            else if (lastCategoryExpanded) {
                await reloadCategoryNode(lastCategoryExpanded, null);
            }
        })()
    }, [lastCategoryExpanded, reloadCategoryNode, categoryId_questionId, categoryId_questionId_done])

    if (categoryId_questionId !== 'add_question') {
        if (lastCategoryExpanded || (categoryId_questionId && categoryId_questionId !== categoryId_questionId_done))
            return <div>loading...</div>
    }

    return (
        <Container>
            <Button variant="secondary" size="sm" type="button"
                onClick={() => dispatch({
                    type: ActionTypes.ADD_SUB_CATEGORY,
                    payload: {
                        parentCategory: null,
                        level: 0
                    }
                })
                }
            >
                Add Category
            </Button>
            <Row className="my-1">
                <Col xs={12} md={7}>
                    <div>
                        <CategoryList parentCategory={null} level={1} title="root" />
                    </div>
                </Col>
                <Col xs={0} md={5}>
                    {/* {store.mode === FORM_MODES.ADD && <Add category={category??initialCategory} />} */}
                    {/* <div class="d-none d-lg-block">hide on screens smaller than lg</div> */}
                    <div id='div-details' className="d-none d-md-block">
                        {state.mode === Mode.ViewingCategory && <ViewCategory inLine={false} />}
                        {state.mode === Mode.EditingCategory && <EditCategory inLine={false} />}
                        {/* {state.mode === FORM_MODES.ADD_QUESTION && <AddQuestion category={null} />} */}
                    </div>
                </Col>
            </Row>

            <Modal
                show={showAddQuestion}
                onHide={handleClose}
                animation={true}
                centered
                size="lg"
                className={`${isDarkMode ? "" : ""}`}
                contentClassName={`${isDarkMode ? "bg-light bg-gradient" : ""}`}
            >
                <Modal.Header closeButton>
                    Put the new Question to Database
                </Modal.Header>
                <Modal.Body className="py-0">
                    {/* <AddQuestion />*/}
                </Modal.Body>
                <Modal.Footer>
                    {createQuestionError}
                </Modal.Footer>
            </Modal>

            {/* <Stack direction="horizontal" gap={3}>
                <DropdownButton
                    id="dropdown-button-dark-example2"
                    variant="secondary"
                    title="Light dropdown"
                    className="mt-2"
                    data-bs-theme={isDarkMode?'dark':'light'}
                >
                    <Dropdown.Item href="#/action-1" active>
                        Action
                    </Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item>
                </DropdownButton>

                <DropdownButton
                    id="dropdown-button-dark-example2"
                    variant="secondary"
                    title="Dark dropdown"
                    className="mt-2"
                    data-bs-theme={isDarkMode?'dark':'light'}
                >
                    <Dropdown.Item href="#/action-1" active>
                        Action {isDarkMode?'dark':'light'}
                    </Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#/action-4">Separated link</Dropdown.Item>
                </DropdownButton>
            </Stack> */}

        </Container>
    );
};

type Params = {
    categoryId_questionId: string | undefined;
};

const Categories = () => {
    let { categoryId_questionId } = useParams<Params>();

    if (categoryId_questionId && categoryId_questionId === 'null')
        categoryId_questionId = undefined;

    if (categoryId_questionId) {
        const arr = categoryId_questionId!.split('_');
        console.assert(arr.length === 2, "expected 'categoryId_questionId'")
    }
    const isAuthenticated = true; // = globalState;

    if (!isAuthenticated)
        return <div>loading...</div>;

    return (
        <CategoryProvider>
            <Providered categoryId_questionId={categoryId_questionId} />
        </CategoryProvider>
    )
}

export default Categories;