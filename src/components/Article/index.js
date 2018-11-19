import { h, Component } from 'preact';

export default class Article extends Component {
	render(props, state) {
		const debugArticle = <pre>{JSON.stringify(props, null, 2)}</pre>;
		const date = new Date(props.createdOn);
		const dateString = `${date.toDateString()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
		const dateEl = <div className="article-date">{dateString}</div>;
		// const img =
		// 	props.opengraph && props.opengraph.image ? (
		// 		<a href={props.link}>
		// 			<LazyLoad offsetVertical={250} offsetTop={250}>
		// 				<img src={props.opengraph.image} width="100" />
		// 			</LazyLoad>
		// 		</a>
		// 	) : (
		// 		''
		// 	);
		const labelList = props.labels.map(label => <span>{label}</span>);
		return (
			<a href={props.link} className="article" data-id={props.id}>
				{props.debug === true ? debugArticle : null}
				{/* {props.opengraph && props.opengraph.image ? img : null} */}
				<div class="text-body">
					<div className="title" href={props.link}>
						{props.title}
					</div>
					{/* {props.labels && props.labels.length > 0 ? (
            <div className="labels">{labelList}</div>
          ) : null} */}
					<div className="feedsrc">{props.feedsrc}</div>

					{props.debug === true ? dateEl : null}
				</div>
			</a>
		);
	}
}
