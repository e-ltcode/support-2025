import React, { useEffect, useState, JSX } from 'react';
import { useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import CatList from 'global/Components/SelectCategory/CatList';
import { ICategory, IQuestion } from 'categories/types';
import { ICat } from 'global/types';
import AssignedAnswersChatBot from 'global/ChatBotPage/AssignedAnswersChatBot';
import { INewQuestion, INextAnswer, useAI } from './useAI'
import { IAnswer } from 'groups/types';
import AnswerList from 'groups/components/answers/AnswerList';

type ChatBotParams = {
	source: string;
	tekst: string;
	email?: string;
};

const ChatBotPage: React.FC = () => {

	let { source, tekst, email } = useParams<ChatBotParams>();

	// TODO do we need this?
	// const globalState = useGlobalState();
	// const {isAuthenticated} = globalState;

	// if (!isAuthenticated)
	//     return <div>loading...</div>;

	const hook = useAI([]);

	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | undefined>(undefined);

	const [autoSuggestId, setAutoSuggestId] = useState<number>(1);
	const [answerId, setAnswerId] = useState<number>(1);
	const [answer, setAnswer] = useState<IAnswer | undefined>(undefined);
	const [hasMoreAnswers, setHasMoreAnswers] = useState<boolean>(false);

	const { getCatsByKind } = useGlobalContext();
	const { dbp, canEdit, authUser, isDarkMode, variant, bg, allCategories } = useGlobalState();

	const setParentCategory = (cat: ICategory) => {
		alert(cat.title)
	}

	const [showUsage, setShowUsage] = useState(false);
	const [catsSelected, setCatsSelected] = useState(false);
	const [showAutoSuggest, setShowAutoSuggest] = useState(false);

	const [catsOptions, setCatOptions] = useState<ICat[]>([]);
	const [catsOptionsSel, setCatsOptionsSel] = useState<Map<string, boolean>>(new Map<string, boolean>());

	const [catsUsage, setCatUsage] = useState<ICat[]>([]);
	const [catsUsageSel, setCatUsageSel] = useState<Map<string, boolean>>(new Map<string, boolean>());


	const [history, setHistory] = useState<IChild[]>([]);

	enum ChildType {
		AUTO_SUGGEST,
		QUESTION,
		ANSWER
	}

	interface IChild {
		type: ChildType;
		isDisabled: boolean;
		txt: string,
		hasMoreAnswers?: boolean
	}
	// const deca: JSX.Element[] = [];

	useEffect(() => {
		(async () => {
			setCatOptions(await getCatsByKind(2));
			setCatUsage(await getCatsByKind(3));
		})()
	}, [allCategories])


	if (catsOptions.length === 0)
		return <div>loading...</div>



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
		setCatsSelected(true);
		setAutoSuggestId(autoSuggestId + 1);
		setShowAutoSuggest(true);
		//setPaymentMethod(value);
	};

	const onSelectQuestion = async (categoryId: string, questionId: number) => {
		// navigate(`/support-2025/categories/${categoryId}_${questionId.toString()}`)
		// const question = await getQuestion(questionId);
		const res: INewQuestion = await (await hook).setNewQuestion(questionId);
		const { question, firstAnswer, hasMoreAnswers } = res; // as unknown as INewQuestion;
		setAutoSuggestId((autoSuggestId) => autoSuggestId + 1);
		setShowAutoSuggest(false);
		setSelectedQuestion(question);
		setHasMoreAnswers(hasMoreAnswers);
		setAnswerId((answerId) => answerId + 1);
		setAnswer(firstAnswer);
	}

	const getNextAnswer = async () => {
		const next: INextAnswer = await (await hook).getNextAnswer();

		const props: IChild = {
			type: ChildType.ANSWER,
			isDisabled: true,
			txt: answer!.title,
			hasMoreAnswers: true
		}
		setHistory((prevHistory) => [...prevHistory, props]);

		const { nextAnswer, hasMoreAnswers } = next;

		setHasMoreAnswers(hasMoreAnswers);
		setAnswerId((answerId) => answerId + 1);
		setAnswer(nextAnswer);
	}

	const AnswerComponent = (props: IChild) => {
		const { isDisabled, txt } = props;
		return (
			<div id={answerId.toString()}>
				<Row className={`${isDarkMode ? "dark" : "light"} border border-1 rounded-1`}>
					<Col xs={9} md={9} classNAme={`${isDisabled ? 'secondary' : 'primary'}`}>
						{txt}
						{/* {isDisabled && txt} */}
						{/* {!isDisabled && answer!.title} */}
						{/* isDisabled={selectedQuestion.isDisabled} */}
					</Col>
					<Col xs={3} md={3}>
						{!isDisabled && <Button
							size="sm"
							type="button"
							onClick={getNextAnswer}
							disabled={!hasMoreAnswers}
							className='align-middle m-1 border border-1 rounded-1 py-0'
						>
							Haven't fixed!
						</Button>
						}
					</Col>
				</Row>
			</div>
		);
	};

	const QuestionComponent = (props: IChild) => {
		const { isDisabled, txt } = props;
		return (
			<Row className={`my-1 ${isDarkMode ? "dark" : ""}`} id={autoSuggestId.toString()}>
				<Col xs={12} md={3} className='mb-1'>
				</Col>
				<Col xs={0} md={9}>
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							{txt}
						</div>
					</div>
				</Col>
			</Row>
		)
	}

	const AutoSuggestComponent = (props: IChild) => {
		const { isDisabled, txt } = props;
		return (
			<Row className={`my-1 ${isDarkMode ? "dark" : ""}`} id={tekst}>
				<Col xs={12} md={3} className='mb-1'>
					<label className="text-info">Please enter the Question</label>
					{/* <CatList
				parentCategory={'null'}
				level={1}
				setParentCategory={setParentCategory}
			/> */}
				</Col>
				<Col xs={0} md={12}>
					{isDisabled &&
						<label className="text-info">Please enter the Question</label>
					}
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75">
							{isDisabled &&
								<div>
									{txt}
								</div>
							}
							{!isDisabled &&
								<AutoSuggestQuestions
									dbp={dbp!}
									tekst={tekst}
									onSelectQuestion={onSelectQuestion}
									allCategories={allCategories}
								/>
							}
						</div>
					</div>
				</Col>
			</Row>
		)
	}

	return (
		<Container id='container' fluid className='text-info'> {/* align-items-center" */}
			<div>
				<p><b>Welcome</b>, I am Buddy and I am here to help You</p>
			</div>

			<Form className='text-center border border-1 m-1 rounded-1'>
				<div className='text-center'>
					Izberi Opcije
				</div>
				<div className='text-center'>
					{/* <ListGroup horizontal> */}
					{catsOptions.map(({ id, title }: ICat) => (
						// <ListGroup.Item>
						<Form.Check // prettier-ignore
							id={id}
							key={id}
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

			{showUsage &&
				<Form className='text-center border border-1 m-1 rounded-1'>
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

			<div className='history'>
				{
					history.map(childProps => {
						switch (childProps.type) {
							case ChildType.AUTO_SUGGEST:
								return <AutoSuggestComponent {...childProps} />;
							case ChildType.QUESTION:
								return <QuestionComponent {...childProps} />;
							case ChildType.ANSWER:
								return <AnswerComponent {...childProps} />;
							default:
								return <div>unknown</div>
						}
					})
				}
			</div>

			{answer &&
				<div>
					<AnswerComponent type={ChildType.ANSWER} isDisabled={false} txt={answer!.title} hasMoreAnswers={hasMoreAnswers} />
				</div>
			}

			{catsSelected && !showAutoSuggest &&
				<Button
					variant="secondary"
					size="sm"
					type="button"
					onClick={() => { 
						setAutoSuggestId(autoSuggestId + 1);
						setShowAutoSuggest(true);
					}
				}
					className='m-1 border border-1 rounded-1 py-0'
				>
					New Question
				</Button>
			}

			{showAutoSuggest && <AutoSuggestComponent type={ChildType.AUTO_SUGGEST} isDisabled={false} txt={tekst!} />}
		</Container>
	);
}

export default ChatBotPage

