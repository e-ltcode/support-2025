import React from 'react';
import { useNavigate, useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import CatList from 'global/Components/SelectCategory/CatList';
import { ICategory } from 'categories/types';

type SupportParams = {
	source: string;
	tekst: string;
	email?: string;
};

const SBBPage: React.FC = () => {

	let { source, tekst, email } = useParams<SupportParams>();
	let navigate = useNavigate();
	if (!email)
		localStorage.removeItem('emailFromClient')
	else if (email !== 'xyz')
		localStorage.setItem('emailFromClient', email ?? 'slavko.parezanin@gmail.com')


	// TODO do we need this?
	// const globalState = useGlobalState();
	// const {isAuthenticated} = globalState;

	// if (!isAuthenticated)
	//     return <div>loading...</div>;

	const onSelectQuestion = async (categoryId: string, questionId: number) => {
		navigate(`/support-2025/categories/${categoryId}_${questionId.toString()}`)
	}

	const { dbp, canEdit, authUser, isDarkMode, variant, bg, allCategories } = useGlobalState();

	const setParentCategory = (cat: ICategory) => {
		alert(cat.title)
	}


	return (
		<Container fluid>



			<Row className="my-1">
				<Col xs={12} md={3} className='mb-1'>
					<CatList
						parentCategory={'null'}
						level={1}
						setParentCategory={setParentCategory}
					/>
				</Col>
				<Col xs={0} md={7}>
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							<AutoSuggestQuestions
								dbp={dbp!}
								tekst={tekst}
								onSelectQuestion={onSelectQuestion}
								allCategories={allCategories}
							/>
						</div>
						<Button
							variant={variant}
							title="Store Question to Knowledge database"
							className="ms-2"
							onClick={() => {
								if (!canEdit) {
									alert('As the member of "Viewers", you have no permission to edit data');
									return false;
								}
								// redirect to categories
								localStorage.setItem('New_Question', JSON.stringify({
									source,
									title: tekst
								}))
								navigate('/2025/categories/add_question')
							}}
						>
							<FontAwesomeIcon icon={faPlus} size="sm" />
							<FontAwesomeIcon icon={faQuestion} size='sm' style={{ marginLeft: '-5px' }} />
						</Button>
					</div>
				</Col>
			</Row>




			<Row className={`${isDarkMode ? "dark" : ""}`}>
				<Col>

				</Col>
			</Row>
		</Container>
	);
}

export default SBBPage

