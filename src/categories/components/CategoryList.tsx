import React from 'react';
import { useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import CategoryRow from "categories/components/CategoryRow";
import { IParentInfo } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";

const CategoryList = ({ title }: IParentInfo) => {
    const { state, getCategories } = useCategoryContext();
    useEffect(() => {
        console.log('getCategories', title)
        getCategories({title});
    }, [getCategories, title]);

   // const mySubCategories = state.categories.filter(c => c.parentCategory === parentCategory);
   const categories = state.categories;
    return (
        <div className={'m-1'}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {categories.map(category => 
                        <CategoryRow category={category} key={category._id! as string} />)
                    }
                </ListGroup>

                {state.error && state.error}
                {/* {state.loading && <div>...loading</div>} */}
            </>
        </div>
    );
};

export default CategoryList;
