import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import './AutoSuggestAnswers.css'

interface IAnswerShort {
	_id: IDBValidKey,
	parentKind: IDBValidKey,
	title: string,
}

interface IKindShort {
	_id: IDBValidKey,
	kindName: string,
	answers: IAnswerShort[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
function escapeRegexCharacters(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();

const AnswerAutosuggestMulti = Autosuggest as { new(): Autosuggest<IAnswerShort, IKindShort> };

interface IProps {
	//kindMap: Map<number, IKindState>,
	wsId: IDBValidKey,
	tekst: string | undefined,
	alreadyAssigned: string,
	onSelectQuestionAnswer: (kindId: IDBValidKey, answerId: IDBValidKey) => void
}

export class AutoSuggestAnswers extends React.Component<IProps, any> {
	// region Fields
	state: any;
	isMob: boolean;
	wsId: IDBValidKey;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		super(props);
		this.state = {
			value: props.tekst || '',
			alreadyAssigned: props.alreadyAssigned,
			suggestions: this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.isMob = isMobile;
		this.wsId = props.wsId;
	}

	componentDidMount() {
		setTimeout(() => {
			window.focus()
			// inputAutosuggest!.current!.focus();
		}, 500)
	}

	// endregion region Rendering methods
	render(): JSX.Element {
		const { value, suggestions, noSuggestions } = this.state;

		return <div>
			<AnswerAutosuggestMulti
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}  // (sl) added
				multiSection={true}
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
				onSuggestionSelected={this.onSuggestionSelected.bind(this)}
				getSuggestionValue={this.getSuggestionValue}
				renderSuggestion={this.renderSuggestion}
				renderSectionTitle={this.renderSectionTitle}
				getSectionSuggestions={this.getSectionSuggestions}
				// onSuggestionHighlighted={this.onSuggestionHighlighted} (sl)
				onSuggestionHighlighted={this.onSuggestionHighlighted.bind(this)}
				highlightFirstSuggestion={false}
				renderInputComponent={this.renderInputComponent}
				renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: 'Search answers',
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No answers to suggest
				</div>
			}
		</div>
	}

	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IAnswerShort>): void {
		const answer: IAnswerShort = data.suggestion;
		// alert(`Selected answer is ${answer.answerId} (${answer.text}).`);
		this.props.onSelectQuestionAnswer(answer.parentKind, answer._id);
	}

	/*
	protected renderSuggestion(suggestion: Answer, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	protected renderSuggestion(suggestion: IAnswerShort, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span>
				{parts.map((part, index) => {
					const className = part.highlight ? 'react-autosuggest__suggestion-match' : undefined;
					return (
						<span className={className} key={index}>
							{part.text}
						</span>
					);
				})}
			</span>
		);
	}

	protected renderSectionTitle(section: IKindShort): JSX.Element {
		const { kindName } = section;
		return <strong>{kindName}</strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IAnswerShort>): JSX.Element {
	// 	 const { onChange, onBlur, ...restInputProps } = inputProps;
	// 	 return (
	// 		  <div>
	// 				<input {...restInputProps} />
	// 		  </div>
	// 	 );
	// }

	protected renderInputComponent(inputProps: Autosuggest.RenderInputComponentProps): JSX.Element {
		const { ref, ...restInputProps } = inputProps;
		// if (ref !== undefined)
		// 	this.inputAutosuggest = ref as React.RefObject<HTMLInputElement>;

		return (
			<div>
				{/* <input {...restInputProps} ref={inputAutosuggest} /> */}
				<input ref={ref} autoFocus {...restInputProps} />
			</div>
		);
	}



	// const Input = forwardRef<HTMLInputElement, Omit<InputProps, "ref">>(
	// 	(props: Omit<InputProps, "ref">, ref): JSX.Element => (
	// 	  <input {...props} ref={ref} />
	// 	)
	//   );


	protected renderSuggestionsContainer({ containerProps, children, query }: Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
		return (
			<div {...containerProps}>
				<span>{children}</span>
			</div>
		);
	}
	// endregion region Event handlers

	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue, method }: Autosuggest.ChangeEvent): void {
		this.setState({ value: newValue });
	}

	protected onSuggestionsFetchRequested({ value }: any): void {
		if (value.trim().length < 2)
			return;
		const search = encodeURIComponent(value.trim().replaceAll('?', ''));
		// axios
		// 	.get(`/api/answers/get-answers/${this.wsId}/${search}/${this.state.alreadyAssigned}`)
		// 	.then(({ data }) => {
		// 		this.setState({
		// 			suggestions: data,
		// 			noSuggestions: data.length === 0
		// 		})
		// 	})
		// 	.catch((error) => {
		// 		console.log(error);
		// 	});
	}

	private anyWord = (valueWordRegex: RegExp[], answerWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let answerWord of answerWords)
				if (valWordRegex.test(answerWord))
					return true;
		return false;
	}
	// endregion region Helper methods
	protected getSuggestions(value: string): IKindShort[] {
		const escapedValue = escapeRegexCharacters(value.trim());

		if (escapedValue === '') {
			return [];
		}
		return [];
	}

	protected getSuggestionValue(suggestion: IAnswerShort) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: IKindShort) {
		return section.answers;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}

