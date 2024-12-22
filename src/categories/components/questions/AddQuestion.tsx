import React, { useState } from "react";
import { useCategoryContext, useCategoryDispatch } from 'categories/CategoryProvider'
import { useGlobalState } from 'global/GlobalProvider'

import QuestionForm from "categories/components/questions/QuestionForm";
import { ActionTypes, FormMode, IQuestion } from "categories/types";

interface IProps {
    question: IQuestion,
    closeModal?: () => void,
    inLine: boolean,
    showCloseButton: boolean,
    setError?: (msg: string) => void
}

const AddQuestion = ({ question, inLine, closeModal, showCloseButton, setError }: IProps) => {
    const globalState = useGlobalState();
    const { authUser } = globalState;
    const { userId, wsId } = authUser;
   
    const dispatch = useCategoryDispatch();
    const { state, createQuestion, reloadCategoryNode } = useCategoryContext();
    if (!closeModal) {
        const cat = state.categories.find(c => c._id === question.parentCategory)
        question.categoryTitle = cat? cat.title: '';
    }
    const [formValues] = useState(question)

    const submitForm = async (questionObject: IQuestion) => {
        delete questionObject.inAdding;
        delete questionObject._id;
        const object: IQuestion = {
            ...questionObject,
            wsId,
            //_id: undefined,
            created: {
                date: new Date(),
                by: {
                    userId
                }
            }
        }
        const question = await createQuestion(object, closeModal !== undefined);
        if (question) {
            if (question.message) {
                setError!(question.message)
            }
            else if (closeModal) {
                closeModal();
                dispatch({ type: ActionTypes.CLEAN_TREE, payload: { _id: question.parentCategory } })
                await reloadCategoryNode(question.parentCategory, question._id);
            }
        }
    }

    return (
        <>
            <QuestionForm
                question={formValues}
                showCloseButton={showCloseButton}
                closeModal={closeModal}
                mode={FormMode.adding}
                submitForm={submitForm}
            >
                Create Question
            </QuestionForm >
        </>
    )
}

export default AddQuestion

