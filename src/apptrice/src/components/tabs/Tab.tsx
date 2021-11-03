import * as React from 'react'
import styles from './_Tabs.module.css';

interface TabProps {
	id: string,
	link?: string
}

export default class Tab extends React.Component<TabProps> {
	render() {
		const {link} = this.props;
		return (
			<div className={styles.tab}>
				<a href={ link ? `/#${link}` : ''}>
					{ this.props.children }
				</a>
			</div>
		)
	}
}
