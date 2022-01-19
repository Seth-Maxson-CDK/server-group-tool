import * as React from 'react';

interface ITitleBarProps
{
	mac: boolean;
}
export class TitleBar extends React.Component<ITitleBarProps> {
	public static defaultProps = {
		mac: false
	};
	render()
	{
		return (
			<div id="title-bar" className={"no-select" + (this.props.mac? " mac" : "")}>
				<div id="title">
					<img src="images/E1.png" alt="image"/>
					{this.props.mac? "Windows Vista" : "Windows 95"}
				</div>
				{
					this.props.mac ?
					<div id="title-bar-btns">
						<button id="close-button">x</button>
						<button id="min-button">-</button>
						<button id="max-button">+</button>
					</div>
						:
					<div id="title-bar-btns">
						<button id="min-button">-</button>
						<button id="max-button">+</button>
						<button id="close-button">X</button>
					</div>
				}
			</div>
		);
	}
}