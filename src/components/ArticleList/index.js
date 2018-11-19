import { h, Component } from 'preact';
import { uniqBy, differenceBy, orderBy } from 'lodash-es';
import InfiniteScroll from 'react-infinite-scroller';
import style from './style';

const API_URL =
	process.env.PREACT_APP_ENV === 'development'
		? 'http://localhost:5001/dev-rdr/us-central1/getArticles'
		: 'https://us-central1-dev-rdr.cloudfunctions.net/getArticles';

class ArticleList extends Component {
	constructor(props) {
		super(props);
		const now = Date.now();
		this.state = {
			articles: [],
			loading: true,
			currentItem: now,
			endOfContent: false
		};
		this.getArticles = this.getArticles.bind(this);
	}

	getArticles(page = null, limit = 25, after = this.state.currentItem, sort = 'desc') {
		const params = { limit, after };
		let url = new URL(API_URL);
		// dumb way to get query params on a url for fetch
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
		return fetch(url)
			.then(data => data.json())
			.then(articles => {
				console.log('articles', articles);
				if (articles.length > 0) {
					this.setState({
						articles: [...this.state.articles, ...articles],
						currentItem: articles[articles.length - 1].createdOn,
						loading: false
					});
				}
				else {
					this.setState({ endOfContent: true, loading: false });
				}
				console.log('this.state', this.state);
			});
	}

	componentDidMount() {
		this.getArticles();
	}

	render(props, state) {
		const loadingSpinner = <img src="/assets/loading.svg" />;
		return (
			<articlelist className={style.list}>
				<InfiniteScroll
					// getScrollParent={() => this.scrollParentRef}
					hasMore={state.endOfContent === false || false}
					loader={
						<div className="loader" key={0}>
							Loading ...
						</div>
					}
					loadMore={this.getArticles}
					// pageStart={0}
					// useWindow={false}
				>
					{state.loading === true ? loadingSpinner : null}
					{state.articles.map((article, key) => (
						<a href={article.link} className={style.article} key={key} {...article}>
							{article.title}
						</a>
					))}
				</InfiniteScroll>
				{state.endOfContent === true ? (
					<div className="quest-complete">
						<div className="emoji">😊</div>
						You have completed your quest.
						<br />
						The interwebs have been read.
					</div>
				) : (
					''
				)}
			</articlelist>
		);
	}
}

export default ArticleList;
