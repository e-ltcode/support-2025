import React, { JSX } from 'react';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";
import { isMobile } from 'react-device-detect'

import { debounce, escapeRegexCharacters } from 'common/utilities'
import './AutoSuggestQuestions.css'
import { IDBPCursorWithValue, IDBPCursorWithValueIteratorValue, IDBPDatabase } from 'idb';
import { IQuestion } from './types';
import { ICat } from 'global/types';

interface IQuestionShort {
	id: number;
	parentCategory: string;
	title: string;
}

interface ICategoryShort {
	id: string,
	parentCategoryUp: string,
	categoryParentTitle: string,
	categoryTitle: string,
	quests: IQuestionShort[]
}

interface IQuest {
	id: number;
	title: string;
	parentCategory: string;
	categoryTitle: string;
}

// interface IQuestionRow {
// 	categoryId: string,
// 	categoryTitle: string,
// 	parentCategoryUp: string,
// 	categoryParentTitle: string, // TODO ???
// 	id: number,
// 	parentCategory: string,
// 	title: string,
// 	tags?: string[] // to keep parantCategory tags
// }

interface IQuestionRowShort {
	categoryId: string,
	categoryTitle: string,
	parentCategoryUp: string,
	categoryParentTitle: string, // TODO ???
	quests: IQuest[]
}

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expression
// s#Using_Special_Characters
// function escapeRegexCharacters(str: string): string {
// 	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }

// autoFocus does the job
//let inputAutosuggest = createRef<HTMLInputElement>();

const QuestionAutosuggestMulti = Autosuggest as { new(): Autosuggest<IQuestionShort, ICategoryShort> };

export class AutoSuggestQuestions extends React.Component<{
	dbp: IDBPDatabase,
	tekst: string | undefined,
	onSelectQuestion: (categoryId: string, questionId: number) => void,
	allCategories: Map<string, ICat>
}, any> {
	// region Fields
	state: any;
	isMob: boolean;
	dbp: IDBPDatabase;
	allCategories: Map<string, ICat>;
	debouncedLoadSuggestions: (value: string) => void;
	//inputAutosuggest: React.RefObject<HTMLInputElement>;
	// endregion region Constructor
	constructor(props: any) {
		super(props);
		this.state = {
			value: props.tekst || '',
			suggestions: [], //this.getSuggestions(''),
			noSuggestions: false,
			highlighted: ''
		};
		//this.inputAutosuggest = createRef<HTMLInputElement>();
		this.dbp = props.dbp;
		this.allCategories = props.allCategories;
		this.isMob = isMobile;
		this.loadSuggestions = this.loadSuggestions.bind(this);
		this.debouncedLoadSuggestions = debounce(this.loadSuggestions, 300);
	}

	async loadSuggestions(value: string) {
		this.setState({
			isLoading: true
		});

		console.time();
		const suggestions = await this.getSuggestions(value);
		console.timeEnd();

		if (value === this.state.value) {
			this.setState({
				isLoading: false,
				suggestions,
				noSuggestions: suggestions.length === 0
			});
		}
		else { // Ignore suggestions if input value changed
			this.setState({
				isLoading: false
			});
		}
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
			<QuestionAutosuggestMulti
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
				// renderSuggestionsContainer={this.renderSuggestionsContainer}
				focusInputOnSuggestionClick={!this.isMob}
				inputProps={{
					placeholder: `Type 'daljinski'`,
					value,
					onChange: (e, changeEvent) => this.onChange(e, changeEvent),
					autoFocus: true
				}}
			/>
			{noSuggestions &&
				<div className="no-suggestions">
					No questions to suggest
				</div>
			}
		</div>
	}

	protected async getSuggestions(value: string): Promise<IQuestionRowShort[]> {
		const escapedValue = escapeRegexCharacters(value.trim());
		if (escapedValue === '') {
			return [];
		}
		if (!this.dbp || value.length < 2)
			return [];

		const catQuests = new Map<string, IQuest[]>();
		// const categoryQuestions = new Map<string, IQuestionRow[]>();
		// const categoryQuestions = new Map<string, IQuest[]>();

		const tx = this.dbp!.transaction(['Categories', 'Questions'], 'readonly');
		const index = tx.objectStore('Questions').index('words_idx');
		const questionRows: number[] = [];
		try {
			//const search = encodeURIComponent(value.trim().replaceAll('?', ''));
			const searchWords = value.toLowerCase().replaceAll('?', '').split(' ').map((s: string) => s.trim());
			// TODO  osim questions, pretrazuj i Categories title
			let i = 0;
			// 1) Find all questions that starts with one of the words
			while (i < searchWords.length) {
				const w = searchWords[i];
				for await (const cursor of index.iterate(IDBKeyRange.bound(w, `${w}zzzzz`, false, true))) {
					const q: IQuestion = { ...cursor!.value, id: parseInt(cursor!.primaryKey.toString()) }
					const { id, parentCategory, title } = q;
					// const row: IQuestionRow = {
					// 	id: id!,
					// 	categoryId: parentCategory,
					// 	categoryTitle: '',
					// 	categoryParentTitle: '',
					// 	parentCategoryUp: '',
					// 	title,
					// 	parentCategory
					// }
					
					if (!questionRows.includes(id!))
						questionRows.push(id!);

					// 2) Group questions by parentCategory
					const quest: IQuest = {
						id: id!,
						parentCategory,
						title,
						categoryTitle: ''
					}
					if (!catQuests.has(parentCategory)) {
						catQuests.set(parentCategory, [quest]);
					}
					else {
						catQuests.get(parentCategory)!.push(quest);
					}
					// if (!categoryQuestions.has(row.categoryId)) {
					// 	categoryQuestions.set(row.categoryId, [row]);
					// }
					// else {
					// 	categoryQuestions.get(row.categoryId)!.push(row);
					// }
				}
				i++;
			}
		}
		catch (error: any) {
			console.debug(error)
		};

		await tx.done;

		if (questionRows.length === 0)
			return [];

		try {
			////////////////////////////////////////////////////////////
			// 2) Create map question.parentCategory => {title and tags}
			// const categoriesStore = tx.objectStore('Categories')
			// const mapParentCategoryTags = new Map<string, ICategoryTags>();
			// let i = 0;
			// while (i < questionRows.length) {
			// 	const row = questionRows[i];
			// 	if (!mapParentCategoryTags.has(row.parentCategory)) {
			// 		const category = await categoriesStore.get(row.parentCategory);
			// 		const { title, tags } = category;
			// 		// if (tags.length > 0) {
			// 		mapParentCategoryTags.set(category.id, { title, tags: { ...tags } })
			// 		// }
			// 	}
			// 	i++;
			// }

			////////////////////////////////////////////////////
			// 3) Group questions by parentCategory
			/*
			const mapCategoryQuestions = new Map<string, IQuestionRow[]>();
			let i = 0;
			while (i < questionRows.length) {
				const row = questionRows[i];
				const catTags = this.categoryTags.get(row.categoryId);
				const { title, tags } = catTags!;
				row.categoryTitle = title;
				row.tags = tags;
				if (!mapCategoryQuestions.has(row.categoryId)) {
					mapCategoryQuestions.set(row.categoryId, [row]);
				}
				else {
					mapCategoryQuestions.get(row.categoryId)!.push(row);
				}
				i++
			};
			console.log('map', mapCategoryQuestions);
			*/

			////////////////////////////////////////////////////////////////
			// 4) insert one question for each tag, add tag at the end of title
			// let keys = mapParentCategory.keys();
			// while (true) {
			// 	let result = keys.next();
			// 	if (result.done) break;
			// 	const zzz = result.value as unknown as ICategoryTags;
			// 	if (zzz.tags.length > 0 ) {
			// 	const newQuestionRows: IQuestionRow[] = [];
			// 	questionRows.forEach(questionRow => newQuestionRows.push(questionRow))
			// 	}
			// }

			////////////////////////////////////////////////////////////
			// map
			// 0 = {'DALJINSKI' => IQuestionRow[2]}
			// 1 = {'EDGE2' => IQuestionRow[3]}
			// 2 = {'EDGE3' => IQuestionRow[4]}

			// let valuesss = mapCategoryQuestions.values();
			// let dataaa: IQuestionRowShort[] = [];
			// while (true) {
			// 	let result = valuesss.next();
			// 	if (result.done) break;
			// 	const rows = result.value as unknown as IQuestionRow[];
			// }

			////////////////////////////////////////////////////////////
			// 5) Go up the category tree, up to the root
			let values = catQuests.values();
			let data: IQuestionRowShort[] = [];
			while (true) {
				let result = values.next();
				if (result.done) break;
				const quests = result.value as unknown as IQuest[];
				const questionRowShort: IQuestionRowShort = {
					categoryId: '',
					categoryTitle: '',
					categoryParentTitle: '',
					parentCategoryUp: '',
					quests: []
				};
				let i = 0;
				while (i < quests.length) {
					const quest = quests[i];
					console.log(quest);
					const { id, title, parentCategory } = quest;
					let categoryParentTitle = '';
					// TODO probaj da ne radis categoriesStore.get kad ne treba
					// let cat = await this.categoryTags.get(categoryId);
					// while (cat!.parentCategory !== 'null') {
					// 	cat = await this.categoryTags.get(cat!.parentCategory);
					// 	categoryParentTitle += ' / ' + cat!.title;
					// }
					const cat = this.allCategories.get(parentCategory);

					if (questionRowShort.categoryId === '') {
						questionRowShort.categoryId = parentCategory;
						questionRowShort.categoryTitle = cat!.title; //categoryTitle;
						questionRowShort.categoryParentTitle = 'kuro'; //categoryParentTitle;
						questionRowShort.parentCategoryUp = cat?.titlesUpTheTree!;
					}

					questionRowShort.quests.push(quest); //{ id, title, parentCategory } as IQuestionShort);
					i++;
				};
				data.push(questionRowShort);
			}
			// await tx.done;
			console.log(data)
			return data;
			// this.setState({ suggestions: data, noSuggestions: data.length === 0 })
		}
		catch (error: any) {
			console.log(error)
		};
		return [];
	}


	protected onSuggestionsClearRequested = () => {
		this.setState({
			suggestions: [],
			noSuggestions: false
		});
	};

	protected onSuggestionSelected(event: React.FormEvent<any>, data: Autosuggest.SuggestionSelectedEventData<IQuestionShort>): void {
		const question: IQuestionShort = data.suggestion;
		// alert(`Selected question is ${question.questionId} (${question.text}).`);
		this.props.onSelectQuestion(question.parentCategory, question.id);
	}

	/*
	protected renderSuggestion(suggestion: Question, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		 const className = params.isHighlighted ? "highlighted" : undefined;
		 return <span className={className}>{suggestion.name}</span>;
	}
	*/

	// TODO bac ovo u external css   style={{ textAlign: 'left'}}
	protected renderSuggestion(suggestion: IQuestionShort, params: Autosuggest.RenderSuggestionParams): JSX.Element {
		// const className = params.isHighlighted ? "highlighted" : undefined;
		//return <span className={className}>{suggestion.name}</span>;
		const matches = AutosuggestHighlightMatch(suggestion.title, params.query);
		const parts = AutosuggestHighlightParse(suggestion.title, matches);
		return (
			<span style={{ textAlign: 'left' }}>
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

	protected renderSectionTitle(section: ICategoryShort): JSX.Element {
		const { parentCategoryUp, categoryParentTitle, categoryTitle } = section;
		// let str = (categoryParentTitle ? (categoryParentTitle + " / ") : "") + categoryTitle;
		// if (parentCategoryUp)
		// 	str = " ... / " + str;
		return <strong>
			{parentCategoryUp}
		</strong>;
	}

	// protected renderInputComponent(inputProps: Autosuggest.InputProps<IQuestionShort>): JSX.Element {
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

	// protected renderSuggestionsContainer({ containerProps, children, query }:
	// 	Autosuggest.RenderSuggestionsContainerParams): JSX.Element {
	// 	return (
	// 		<div {...containerProps}>
	// 			<span>{children}</span>
	// 		</div>
	// 	);
	// }
	// endregion region Event handlers

	protected onChange(event: /*React.ChangeEvent<HTMLInputElement>*/ React.FormEvent<any>, { newValue, method }: Autosuggest.ChangeEvent): void {
		this.setState({ value: newValue });
	}

	// getParentTitle = async (id: string): Promise<any> => {
	// 	let category = await this.dbp.get('Categories', id);
	// 	return { parentCategoryTitle: category.title, parentCategoryUp: '' };
	// }

	protected async onSuggestionsFetchRequested({ value }: any): Promise<void> {
		return /*await*/ this.debouncedLoadSuggestions(value);

	}

	private anyWord = (valueWordRegex: RegExp[], questionWords: string[]): boolean => {
		for (let valWordRegex of valueWordRegex)
			for (let questionWord of questionWords)
				if (valWordRegex.test(questionWord))
					return true;
		return false;
	}

	////////////////////////////////////
	// endregion region Helper methods

	protected getSuggestionValue(suggestion: IQuestionShort) {
		return suggestion.title;
	}

	protected getSectionSuggestions(section: ICategoryShort) {
		return section.quests;
	}

	protected onSuggestionHighlighted(params: Autosuggest.SuggestionHighlightedParams): void {
		this.setState({
			highlighted: params.suggestion
		});
	}
	// endregion
}