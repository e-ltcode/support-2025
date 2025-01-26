import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import CatList from 'global/Components/SelectCategory/CatList';
import { ICategory, IQuestion } from 'categories/types';
import { ICat } from 'global/types';
import AssignedAnswers from 'global/ChatBotPage/AssignedAnswers';

type SupportParams = {
	source: string;
	tekst: string;
	email?: string;
};

const ChatBotPage: React.FC = () => {

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

	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | undefined>(undefined);

	const onSelectQuestion = async (categoryId: string, questionId: number) => {
		// navigate(`/support-2025/categories/${categoryId}_${questionId.toString()}`)
		const question = await getQuestion(questionId);
		setSelectedQuestion(question);
	}

	const { getCatsByKind, getQuestion } = useGlobalContext();
	const { dbp, canEdit, authUser, isDarkMode, variant, bg, allCategories } = useGlobalState();

	const setParentCategory = (cat: ICategory) => {
		alert(cat.title)
	}

	const [showUsage, setShowUsage] = useState(false);
	const [showAutoSuggest, setShowAutoSuggest] = useState(false);

	const [catsOptions, setCatOptions] = useState<ICat[]>([]);
	const [catsOptionsSel, setCatsOptionsSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	const [catsUsage, setCatUsage] = useState<ICat[]>([]);
	const [catsUsageSel, setCatUsageSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	useEffect(() => {
		(async () => {
			setCatOptions(await getCatsByKind(2));
			setCatUsage(await getCatsByKind(3));
		})()
	}, [])


	const onOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name as any;
		setShowUsage(true)
		// setCatOptions((prevState) => ({ 
		// 	stateName: prevState.stateName + 1 
		// }))
		// this.setState({
		// 	 [name]: value
		// });
	}

	//const onUsageChange = ({ target: { value } }) => {
	const onUsageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name as any;
		setShowAutoSuggest(true);
		//setPaymentMethod(value);
	};



	return (
		<Container fluid className='text-info'>
			<div>
				<p>Dobrodošli! Ja sam SBBuddy i tu sam da Vam pomognem :)</p>
				{/* <p>U slučaju da se odnosi na ugovor i račune, pripremite ID korisnika. Podatak se nalazi na SBB računu</p> */}
			</div>
			<Form className='text-center border border-1 m-1'>
				<div className='text-center'>
					Izberi Opcije
				</div>
				<div className='text-center'>
					{/* <ListGroup horizontal> */}
						{catsOptions.map(({ id, title }: ICat) => (
							// <ListGroup.Item>
								<Form.Check // prettier-ignore
									id={id}
									label={title}
									name="opcije"
									type='checkbox'
									inline
									className=''
									onChange={onOptionChange}
								/>
							// </ListGroup.Item>
						))}
					{/* </ListGroup> */}
				</div>
			</Form>
			{showUsage && <Form className='text-center border border-1 m-1'>
				<div className='text-center'>
					Izaberite uslugu za koju Vam je potrebna podrška
				</div>
				<div className='text-center'>
					{catsUsage.map(({ id, title }: ICat) => (
						<Form.Check // prettier-ignore
							id={id}
							label={title}
							name="usluge"
							type='checkbox'
							inline
							className=''
							onChange={onUsageChange}
						/>
					))}
				</div>
			</Form>
			}

			{/* align-items-center" */}
			{ showAutoSuggest && <Row className={`my-1 ${isDarkMode ? "dark" : ""}`}>
				<Col xs={12} md={3} className='mb-1'>
					{/* <CatList
						parentCategory={'null'}
						level={1}
						setParentCategory={setParentCategory}
					/> */}
				</Col>
				<Col xs={0} md={12}>
					<label className="text-info">Please enter the Question</label>
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							<AutoSuggestQuestions
								dbp={dbp!}
								tekst={tekst}
								onSelectQuestion={onSelectQuestion}
								allCategories={allCategories}
							/>
						</div>
						{/* <Button
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
						</Button> */}
					</div>
				</Col>
			</Row>
			}

			{selectedQuestion &&
				<Row className={`${isDarkMode ? "dark" : "light"}`}>
					<Col>
						<AssignedAnswers
							questionId={selectedQuestion.id!}
							questionTitle={selectedQuestion.title}
							assignedAnswers={selectedQuestion.assignedAnswers}
							isDisabled={false}
						/>
						{/* isDisabled={selectedQuestion.isDisabled} */}
					</Col>
				</Row>
			}
		</Container>
	);
}

export default ChatBotPage

