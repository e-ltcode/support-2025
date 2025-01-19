import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRemove, faQuestion, faPlus, faReply } from '@fortawesome/free-solid-svg-icons'

import { ListGroup, Button, Badge } from "react-bootstrap";

import { useGlobalState } from 'global/GlobalProvider'
import { ActionTypes, ICategoryInfo, Mode } from "categories/types";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useHover } from 'common/components/useHover';
import { IQuestion } from 'categories/types'

import AddQuestion from "categories/components/questions/AddQuestion";
import EditQuestion from "categories/components/questions/EditQuestion";
import ViewQuestion from "categories/components/questions/ViewQuestion";
import Q from 'assets/Q.png';
import A from 'assets/A.png';

//const QuestionRow = ({ question, categoryInAdding }: { ref: React.ForwardedRef<HTMLLIElement>, question: IQuestion, categoryInAdding: boolean | undefined }) => {
const QuestionRow = ({ question, categoryInAdding }: { question: IQuestion, categoryInAdding: boolean | undefined }) => {
    const { id, parentCategory, level, title, inViewing, inEditing, inAdding, numOfAssignedAnswers } = question;

    const { canEdit, isDarkMode, variant, bg } = useGlobalState();

    const { state, viewQuestion, editQuestion, deleteQuestion } = useCategoryContext();
    const dispatch = useCategoryDispatch();

    const alreadyAdding = state.mode === Mode.AddingQuestion;

    const del = () => {
        deleteQuestion(id!, parentCategory);
    };

    const edit = (id: number) => {
        // Load data from server and reinitialize question
        editQuestion(id);
    }

    const onSelectQuestion = (id: number) => {
        // Load data from server and reinitialize question
        if (canEdit)
            editQuestion(id);
        else
            viewQuestion(id);
    }

    const [hoverRef, hoverProps] = useHover();

    const Row1 =
        <div ref={hoverRef} className="d-flex justify-content-start align-items-center w-100 text-secondary">
            <Button
                variant='link'
                size="sm"
                className="py-0 px-1 text-secondary"
            >
                <img width="22" height="18" src={Q} alt="Question" />
                {/* <FontAwesomeIcon
                    icon={faQuestion}
                    size='sm'
                /> */}
            </Button>

            <Button
                variant='link'
                size="sm"
                className={`py-0 mx-0 text-decoration-none text-secondary ${(inViewing || inEditing) ? 'fw-bold' : ''}`}
                title={`id:${id!.toString()}`}
                onClick={() => onSelectQuestion(id!)}
                disabled={alreadyAdding}
            >
                {title}
            </Button>

            <Badge pill bg="secondary" className={`text-info ${numOfAssignedAnswers === 0 ? 'd-none' : 'd-inline'}`}>
                {numOfAssignedAnswers}a
                {/* <FontAwesomeIcon icon={faReply} size='sm' /> */}
                {/* <img width="22" height="18" src={A} alt="Answer"></img> */}
            </Badge>

            {/* {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 px-1 text-secondary"
                    //onClick={() => { dispatch({ type: ActionTypes.EDIT, question }) }}>
                    onClick={() => edit(_id!)}
                >
                    <FontAwesomeIcon icon={faEdit} size='lg' />
                </Button>
            } */}

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button variant='link' size="sm" className="ms-1 py-0 mx-1 text-secondary"
                    onClick={del}
                >
                    <FontAwesomeIcon icon={faRemove} size='lg' />
                </Button>
            }

            {canEdit && !alreadyAdding && hoverProps.isHovered &&
                <Button
                    variant='link'
                    size="sm"
                    className="ms-2 py-0 mx-1 text-secondary"
                    title="Add Question"
                    onClick={() => {
                        console.log('click q')
                        const categoryInfo: ICategoryInfo = { id: parentCategory, level }
                        dispatch({ type: ActionTypes.ADD_QUESTION, payload: { categoryInfo } })
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} size='lg' />
                    {/* <FontAwesomeIcon icon={faQuestion} size='lg' style={{ marginLeft: '-5px' }} /> */}
                    <img width="18" height="14" src={A} alt="Answer" style={{ marginLeft: '-2px' }} />
                </Button>
            }
        </div>

    return (
        // <ListGroup.Item
        //     variant={"secondary"}
        //     className="py-0 px-1 w-100"
        //     as="li"
        // >
        <div className="py-0 px-1 w-100 list-group-item">
            {inAdding && categoryInAdding && state.mode === Mode.AddingQuestion ? (
                <AddQuestion question={question} inLine={true} showCloseButton={true} />
            )
                : ((inEditing && state.mode === Mode.EditingQuestion) ||
                    (inViewing && state.mode === Mode.ViewingQuestion)) ? (
                    <>
                        {/* <div class="d-lg-none">hide on lg and wider screens</div> */}
                        <div id='div-question' className="ms-0 d-md-none w-100">
                            {inEditing && <EditQuestion inLine={true} />}
                            {inViewing && <ViewQuestion inLine={true} />}
                        </div>
                        <div className="d-none d-md-block">
                            {Row1}
                        </div>
                    </>
                )
                    : (
                        Row1
                    )
            }
        </div>
        // </ListGroup.Item>
    );
};

export default QuestionRow;
