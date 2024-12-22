import React from 'react';
import { useNavigate, useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'

type SupportParams = {
	source: string;
	tekst: string;
	email?: string;
};

const SupportPage: React.FC = () => {

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


	const onSelectQuestion = async (categoryId: string, questionId: string) => {
		navigate(`/categories/${categoryId.toString()}_${questionId.toString()}`)
	}

	const { canEdit, authUser, isDarkMode, variant, bg } = useGlobalState();
	const { wsId } = authUser;

	return (
		<Container fluid>
			<Row className={`${isDarkMode ? "dark" : ""}`}>
				<Col>
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							<AutoSuggestQuestions
								wsId={wsId}
								tekst={tekst}
								onSelectQuestion={onSelectQuestion}
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
								navigate('/categories/add_question')
							}}
						>
							<FontAwesomeIcon icon={faPlus} size="sm" />
							<FontAwesomeIcon icon={faQuestion} size='sm' style={{ marginLeft: '-5px' }} />
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default SupportPage

