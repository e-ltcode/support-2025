import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { IParentInfo, IQuestion, IQuestionAnswer } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { useGlobalState } from "global/GlobalProvider";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { ListItem } from "./list";
import QuestionRow from "categories/components/questions/QuestionRow";


type ListProps = {
  direction?: 'vertical' | 'horizontal';
  children: React.ReactNode;
};

// type ListItemProps = {
//     question: IQuestion;
//     categoryInAdding: boolean;
//     children: React.ReactNode;
//     // ref?: React.ForwardedRef<HTMLLIElement>;
// };


// function QuestionRow({ item }: { item: IQuestion }) {
//     return (
//         <div className="py-0 px-1 w-100 secondary" key={item.key}>
//             <Button
//                 variant='link'
//                 size="sm"
//                 className={`py-0 mx-0 text-decoration-none text-secondary`}
//                 title={ item.key!.toString()}
//             >
//                 {item.value}
//             </Button>
//         </div>
//     )
// }

// , value }: IQuestion  { ref: React.ForwardedRef<HTMLLIElement>, question: IQuestion, categoryInAdding: boolean | undefined }) => {




function List({ direction, ...rest }: ListProps) {
  return (
    // <ListGroup as="ul" variant='dark' className={level > 1 ? 'mb-0 ms-2' : 'mb-0'}
    // <ListGroup as="ul" variant='dark' className={'block mb-0 ms-2'}>
    // </ListGroup>
    <ul
      className={`p-0 ${direction === 'horizontal' ? 'flex' : 'block'} list-group list-group-darkr`}
      {...rest}
    />
  );
}

export function Loading() {
  return (
    <div className="animate-pulse bg-slate-600 p-2 text-white">Loading...</div>
  );
}

interface Response {
  hasNextPage: boolean;
  data: IQuestion[];
}

const ARRAY_SIZE = 20;
const RESPONSE_TIME_IN_MS = 1000;

function loadItems(startCursor = 0): Promise<Response> {
  return new Promise((resolve) => {
    let newArray: IQuestion[] = [];

    setTimeout(() => {
      for (let id = startCursor; id < startCursor + ARRAY_SIZE; id++) {
        const newItem = {
          id,
          title: `This is item ${id.toString()}`,
          wsId: '',
          level: 0,
          parentCategory: 'SAFARI',
          questionAnswers: [],
          source: 0,
          status: 0
        };
        newArray = [...newArray, newItem];
      }

      resolve({ hasNextPage: true, data: newArray });
    }, RESPONSE_TIME_IN_MS);
  });
}



export function useLoadQuestions() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  async function loadMore() {
    setLoading(true);
    try {
      const { data, hasNextPage: newHasNextPage } = await loadItems(questions.length);
      setQuestions((current) => [...current, ...data]);
      setHasNextPage(newHasNextPage);
    }
    catch (error_) {
      setError(
        error_ instanceof Error ? error_ : new Error('Something went wrong'),
      );
    }
    finally {
      setLoading(false);
    }
  }

  return { loading, questions, hasNextPage, error, loadMore };
}


const QuestionList = ({ title, parentCategory, level }: IParentInfo) => {

  const pageSize = 100;
  const { canEdit } = useGlobalState();

  const { state, loadCategoryQuestions, editQuestion, viewQuestion } = useCategoryContext();
  const { parentNodes, categories, questionLoading, error } = state;
  const { categoryId, questionId } = parentNodes!;

  const category = categories.find(c => c.id === parentCategory)!
  const { questions, numOfQuestions, hasMore } = category;

  async function loadMore() {
    try {
      const includeQuestionId = parentNodes.questionId ? parseInt(parentNodes.questionId) : undefined;
      await loadCategoryQuestions({ parentCategory, startCursor: questions.length, level: 0, includeQuestionId});
    }
    catch (error_) {
    }
    finally {
    }
  }

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: questionLoading,
    hasNextPage: hasMore!,
    onLoadMore: loadMore,
    disabled: Boolean(error),
    rootMargin: '0px 0px 100px 0px',
  });

  useEffect(() => {
    if (categoryId != null) {
      if (categoryId === parentCategory!.toString() && questionId) {
        setTimeout(() => {
          if (canEdit)
            editQuestion(parseInt(questionId))
          else
            viewQuestion(parseInt(questionId))
        }, 3000)
      }
    }
  }, [viewQuestion, parentCategory, categoryId, questionId, canEdit]);

  // console.log('QuestionList render', questions, level)

  return (
    <div
      ref={rootRef}
      className="ms-2 border"
      // className="max-h-[500px] max-w-[500px] overflow-auto bg-slate-100"
      style={{ maxHeight: '300px', overflowY: 'auto' }}
    >
      <List>
        {!questions && 
          <div>No questions</div>
        }
        {questions.map((question: IQuestion) => {
          return <ListItem key={question.id}>
            <QuestionRow
              question={question}
              categoryInAdding={category!.inAdding}
            />
          </ListItem>
        })}
        {hasMore && (
          <ListItem ref={infiniteRef}>
            <Loading />
          </ListItem>
        )}
      </List>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default QuestionList;
