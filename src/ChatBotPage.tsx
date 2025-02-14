import React, { useEffect, useState, useRef, RefObject } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
import { ICategory, IQuestion } from 'categories/types';
import { ICat } from 'global/types';
import AssignedAnswersChatBot from 'global/ChatBotPage/AssignedAnswersChatBot';
import './styles/chatbot.css';

type SupportParams = {
	source: string;
	tekst: string;
	email?: string;
};

const ChatBotPage: React.FC = () => {
	let { source, tekst, email } = useParams<SupportParams>();
	let navigate = useNavigate();
	
	if (!email) {
		localStorage.removeItem('emailFromClient');
	} else if (email !== 'xyz') {
		localStorage.setItem('emailFromClient', email ?? 'slavko.parezanin@gmail.com');
	}

	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | undefined>(undefined);
	const [showUsage, setShowUsage] = useState(false);
	const [showAutoSuggest, setShowAutoSuggest] = useState(false);
	const [catsOptions, setCatOptions] = useState<ICat[]>([]);
	const [catsUsage, setCatUsage] = useState<ICat[]>([]);

	const { getCatsByKind, getQuestion } = useGlobalContext();
	const { dbp, isDarkMode, allCategories } = useGlobalState();

	const usageRef = useRef<HTMLDivElement>(null);
	const autoSuggestRef = useRef<HTMLDivElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	const scrollToSection = (ref: RefObject<HTMLDivElement | null>) => {
		setTimeout(() => {
			if (ref.current) {
				ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	};

	useEffect(() => {
		(async () => {
			setCatOptions(await getCatsByKind(2));
			setCatUsage(await getCatsByKind(3));
		})();
	}, [getCatsByKind]);

	const onSelectQuestion = async (categoryId: string, questionId: number) => {
		const question = await getQuestion(questionId);
		setSelectedQuestion(question);
		scrollToSection(resultsRef);
	};

	const handleOptionChange = () => {
		setShowUsage(true);
		scrollToSection(usageRef);
	};

	const handleUsageChange = () => {
		setShowAutoSuggest(true);
		scrollToSection(autoSuggestRef);
	};

	return (
		<Container className="chatbot-container">
			<div className="chatbot-welcome">
				<FontAwesomeIcon icon={faRobot} size="2x" className="mb-3 text-primary" />
				<h4>Dobrodošli! Ja sam SBBuddy</h4>
				<p>Tu sam da Vam pomognem pronaći odgovore na Vaša pitanja</p>
			</div>

			<div className="chatbot-section">
				<div className="chatbot-section-title">
					Izaberite opcije koje Vas interesuju
				</div>
				<div className="chatbot-options">
					{catsOptions.map(({ id, title }: ICat) => (
						<div key={id} className="chatbot-check">
							<Form.Check
								id={id}
								label={title}
								name="opcije"
								type="checkbox"
								onChange={handleOptionChange}
							/>
						</div>
					))}
				</div>
			</div>

			{showUsage && (
				<div className="chatbot-section" ref={usageRef}>
					<div className="chatbot-section-title">
						Izaberite uslugu za koju Vam je potrebna podrška
					</div>
					<div className="chatbot-options">
						{catsUsage.map(({ id, title }: ICat) => (
							<div key={id} className="chatbot-check">
								<Form.Check
									id={id}
									label={title}
									name="usluge"
									type="checkbox"
									onChange={handleUsageChange}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{showAutoSuggest && (
				<div className="chatbot-section chatbot-search" ref={autoSuggestRef}>
					<div className="chatbot-section-title">
						Kako Vam mogu pomoći?
					</div>
					<Row>
						<Col xs={12}>
							<AutoSuggestQuestions
								dbp={dbp!}
								tekst={tekst}
								onSelectQuestion={onSelectQuestion}
								allCategories={allCategories}
							/>
						</Col>
					</Row>
				</div>
			)}

			{selectedQuestion && (
				<div className="chatbot-results" ref={resultsRef}>
					<AssignedAnswersChatBot
						questionId={selectedQuestion.id!}
						questionTitle={selectedQuestion.title}
						assignedAnswers={selectedQuestion.assignedAnswers}
						isDisabled={false}
					/>
				</div>
			)}
		</Container>
	);
};

export default ChatBotPage;

