import { render } from 'preact';
import { App } from './app';
import { perf } from './lib/perf';
import './styles/tokens.css';
import './styles/home.css';
import './styles/settings.css';

perf.mark('script');
render(<App />, document.getElementById('app')!);
perf.mark('render');
