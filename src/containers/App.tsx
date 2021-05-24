import {useRoutes} from 'hookrouter';

import './App.scss';
import About from './About/About';
import Contact from './Contact/Contact';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import Home from './Home/Home';
import Sudt from './Sudt/Sudt';

const routes =
{
	'/': () => <Home />,
	'/sudt': () => <Sudt />,
	'/about': () => <About />,
	'/contact': () => <Contact />,
};

function App()
{
	const routeResult = useRoutes(routes);

	let html = 
	(
		<>
			<Header />
			<section className="main">
				{routeResult}
			</section>
			<Footer />
		</>
	);

	return html;
}

export default App;
