import React, { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import QuestionRow from "categories/components/questions/QuestionRow";
import { IQuestion, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";

const QuestionList = ({ title, groupId }: IParentInfo) => {
    const { canEdit } = useGlobalState();

    const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
    // const { parentCategories } = state;
    // const { categoryId, questionId } = parentCategories!;

    useEffect(() => {
         //console.log('getCategoryQuestions', title)
         loadCategoryQuestions({ groupId });
    }, [groupId]);

    // useEffect(() => {
    //     if (groupId != null) {
    //         if (groupId === groupId!.toString() && questionId) {
    //             setTimeout(() => {
    //                 if (canEdit)
    //                     editQuestion(new Types.ObjectId(questionId))
    //                 else
    //                     viewQuestion(new Types.ObjectId(questionId))
    //             }, 3000)
    //         }
    //     }
    // }, [viewQuestion, groupId, categoryId, questionId]);


    // console.log('level, parentCategory:', level, parentCategory)
    const category = state.categories.find(c => c._id === groupId);
    const { questions } = category!;

    console.log('QuestionList render'); 

    return (
        <div className={`ms-0`}>
            <>
                <ListGroup as="ul" variant='dark' className={'mb-0 ms-2'}>
                    {questions.map((question: IQuestion) =>
                        <QuestionRow
                            question={question}
                            categoryInAdding={category!.inAdding}
                            key={question._id!.toString()}
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

