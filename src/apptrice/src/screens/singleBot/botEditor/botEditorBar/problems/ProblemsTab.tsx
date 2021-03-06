import * as React from 'react'
import EditorTab from '../../components/EditorTab';
import styles from './_ProblemsTab.module.css';
export interface CodeProblem {
	startLineNumber: number,
	startColumn: number,
	message: string,
	severity: number
}
interface ProblemsTabProps {
	id: string
	active: boolean
	onClick: (id: string) => void
	problems: CodeProblem[]
}

export default class ProblemsTab extends React.Component<ProblemsTabProps> {
	render() {
		return (
			<EditorTab active={this.props.active} onClick={ this.props.onClick } id={this.props.id}>
				{ this.renderProblems() }
			</EditorTab>
		);
	}


	renderProblems() {
		let errors: CodeProblem[] = [];
		let warnings: CodeProblem[] = [];
		let count = 0;
		this.props.problems.forEach(problem => {
			if (problem.severity > 5) {
				errors.push(problem);
				count++;
			}
			else if (problem.severity > 2) {
				warnings.push(problem);
				count++;
			}
		});

		if( count === 0 ){
			return this.renderOk();
		}

		return (
			<>
				{ this.renderErrors(errors)}
				{ this.renderWarnings(warnings)}
			</>
		);
	}

	renderOk(){
		return (
			<div className={styles.ok}>
				<i className="far fa-check-circle"></i>
				<span> 0</span>
			</div>
		)
	}

	renderErrors(errors: CodeProblem[]) {
		if (!errors.length) return;
		return (
			<div className={styles.errorCount}>
				<i className={`fas fa-exclamation-triangle ${styles.error}`}></i>
				<span> {errors.length}</span>
			</div>
		);
	}

	renderWarnings(warnings: CodeProblem[]) {
		if (!warnings.length) return;
		return (
			<div className={styles.warningCount}>
				<i className={`fas fa-exclamation-triangle ${styles.warning}`}></i>
				<span> {warnings.length}</span>
			</div>
		);
	}
}
