import {useRoutes} from 'hookrouter';

import './App.scss';
import About from './About/About';
import Address from './Address/Address';
import Contact from './Contact/Contact';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import Home from './Home/Home';
import Sudt from './Sudt/Sudt';

const routes =
{
	'/': () => <Home />,
	'/about': () => <About />,
	'/address': () => <Address />,
	'/contact': () => <Contact />,
	'/sudt': () => <Sudt />,
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
