import React, { useCallback, useEffect, useRef } from "react";
import { ListGroup } from "react-bootstrap";
import QuestionRow from "categories/components/questions/QuestionRow";
import { IQuestion, IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";
import { useLoadItems } from './utils';
import { List, ListItem, Loading } from './list';
import useInfiniteScroll from "react-infinite-scroll-hook";

const QuestionList = ({ title, parentCategory, level }: IParentInfo) => {

    const pageSize = 100;
    const { canEdit } = useGlobalState();

    const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
    const { parentCategories, categories, error } = state;
    const { categoryId, questionId } = parentCategories!;

    const category = categories.find(c => c.id === parentCategory)!
    const { questions, numOfQuestions, questionsPaging } = category;
    const { page, isLoading, numOfQuestionsTotal } = questionsPaging!;

    const { loading, items, hasNextPage/*, error*/, loadMore } = useLoadItems();

    const [infiniteRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage,
        onLoadMore: loadMore,
        disabled: Boolean(error),
        rootMargin: '0px 0px 400px 0px',
    });

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
    }, [viewQuestion, parentCategory, categoryId, questionId, canEdit]);


    // console.log('level, parentCategory:', level, parentCategory)
    const { } = category!;

    // console.log('QuestionList render', questions, level)

    return (
        // <div className={`ms-0`}>
        //     <>
        //         <ListGroup as="ul" variant='dark' className={level > 1 ? 'mb-0 ms-2' : 'mb-0'}>
        //             {questions.map((question: IQuestion) =>
        //                 <QuestionRow
        //                     question={question}
        //                     categoryInAdding={category!.inAdding}
        //                     key={question.id}
        //                 />)
        //                 // category={cat}
        //             }
        //         </ListGroup>

        //         {state.error && state.error}
        //         {/* {state.loading && <div>...loading</div>} */}
        //     </>
        // </div>

        // <div className={`ms-0`} style={{ height: '300px', overflowY: 'auto' }}>   
        <div
            ref={rootRef}
            className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
        >
            <List>
                {items.map((item) => (
                    <ListItem key={item.key}>{item.value}</ListItem>
                ))}
                {hasNextPage && (
                    <ListItem ref={infiniteRef}>
                        <Loading />
                    </ListItem>
                )}
            </List>
            {error && <p>Error: {error.message}</p>}
        </div>
        // </div>
    );
};

export default QuestionList;
