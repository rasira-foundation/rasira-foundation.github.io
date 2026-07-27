import oneLineLogo from '../../assets/rasira-1line.svg';
import { navigateHome } from '../../hooks/useHashRoute';
import './siteHeader.css';

export function SiteHeader() {
  return (
    <header className="site-header">
      <button type="button" className="site-header-logo" onClick={navigateHome} aria-label="Rasira Foundation — home">
        <img src={oneLineLogo} alt="Rasira Foundation" />
      </button>
    </header>
  );
}
