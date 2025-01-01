import { IQuestion } from 'categories/types';
import { useState } from 'react';

const ARRAY_SIZE = 20;
const RESPONSE_TIME_IN_MS = 1000;

// export interface IQuestion {
//   key: number;
//   value: string;
// }

interface Response {
  hasNextPage: boolean;
  data: IQuestion[];
}

function loadItems(startCursor = 0): Promise<Response> {
  return new Promise((resolve) => {
    let newArray: IQuestion[] = [];

    setTimeout(() => {
      for (let i = startCursor; i < startCursor + ARRAY_SIZE; i++) {
        const newItem = {
          id: i.toString(),
          title: `This is item ${i.toString()}`,
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
      const { data, hasNextPage: newHasNextPage } = await loadItems(
        questions.length,
      );
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
