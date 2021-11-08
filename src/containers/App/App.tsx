import {useRoutes} from 'hookrouter';

import './App.scss';
import About from '../About/About';
import Address from '../Address/Address';
import Bootstrap from '../Bootstrap/Bootstrap';
import Contact from '../Contact/Contact';
import Footer from '../../components/Footer/Footer';
import Generator from '../Generator/Generator';
import Header from '../../components/Header/Header';
import Home from '../Home/Home';
import Sudt from '../Sudt/Sudt';
import CreateLayerTwoAccount from '../CreateLayerTwoAccount/CreateLayerTwoAccount';

const routes =
{
	'/': () => <Home />,
	'/about': () => <About />,
	'/address': () => <Address />,
	'/bootstrap': () => <Bootstrap />,
	'/contact': () => <Contact />,
	'/generator': () => <Generator />,
	'/sudt': () => <Sudt />,
	'/create-layer2-account': () => <CreateLayerTwoAccount />,
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
