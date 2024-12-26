import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import QuestionRow from "categories/components/questions/QuestionRow";
import { IQuestion, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";

const QuestionList = ({ title, parentCategory, level }: IParentInfo) => {
    const { canEdit } = useGlobalState();

    const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
    const { parentCategories } = state;
    const { categoryId, questionId } = parentCategories!;

    useEffect(() => {
        //console.log('loadCategoryQuestions', title, level)
        loadCategoryQuestions({ parentCategory, level });
    }, [level, loadCategoryQuestions, parentCategory]);

    useEffect(() => {
        if (categoryId != null) {
            if (categoryId === parentCategory!.toString() && questionId) {
                setTimeout(() => {
                    if (canEdit)
                        editQuestion(questionId)
                    else
                        viewQuestion(questionId)
                }, 3000)
            }
        }
    }, [viewQuestion, parentCategory, categoryId, questionId]);


    // console.log('level, parentCategory:', level, parentCategory)
    const category = state.categories.find(c => c.id === parentCategory);
    const { questions } = category!;

    // console.log('QuestionList render', questions, level)

    return (
        <div className={`ms-0`}>
            <>
                <ListGroup as="ul" variant='dark' className={level > 1 ? 'mb-0 ms-2' : 'mb-0'}>
                    {questions.map((question: IQuestion) =>
                        <QuestionRow
                            question={question}
                            categoryInAdding={category!.inAdding}
                            key={question.id}
                        />)
                        // category={cat}
                    }
                </ListGroup>

                {state.error && state.error}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default QuestionList;
