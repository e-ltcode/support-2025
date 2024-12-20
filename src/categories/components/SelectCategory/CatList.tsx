import React from 'react';

import { useEffect, useReducer } from "react";
import { ListGroup } from "react-bootstrap";
import CatRow from "categories/components/SelectCategory/CatRow";
import { CatsActionTypes, ICatInfo, ICategory } from "categories/types";
import { useCategoryContext } from "categories/CategoryProvider";
import { CatsReducer, initialState } from "./CatsReducer";

const CatList = ({ parentCategory, level, setParentCategory }: ICatInfo) => {
    const [state, dispatch] = useReducer(CatsReducer, initialState);
    // const { getCats } = useCategoryContext();
    // useEffect(() => {
    //     (async () => {
    //         // { parentCategory, level }
    //         const subCats = await getCats();  
    //         console.log('getSubCats', parentCategory, level, subCats);
    //         dispatch({ type: CatsActionTypes.SET_SUB_CATS, payload: { subCats } });
    //     })()
    // }, [getCats, parentCategory, level]);

    const mySubCategories = state.cats.filter(c => c.parentCategory === parentCategory);

    const setParentCat = (cat: ICategory) => {
        dispatch({ type: CatsActionTypes.SET_PARENT_CATEGORY, payload: { category: cat } })
        setParentCategory!(cat);
    }

    return (
        <div className={level > 1 ? 'ms-4' : ''}>
            <>
                <ListGroup as="ul" variant='dark' className="mb-0">
                    {mySubCategories.map(category =>
                        <CatRow
                            category={category}
                            dispatch={dispatch}
                            setParentCategory={setParentCat}
                            key={category._id!.toString()}
                        />
                    )
                    }
                </ListGroup>

                {state.error && state.error}
            </>
        </div>
    );
};

export default CatList;
